import { NextRequest, NextResponse } from "next/server";

import { cronAuth, cronUnauthorized } from "@/lib/cron-auth";

import {
  cohortFullEmail,
  cohortQuarterEmail,
  cohortSeatsLeftEmail,
  premiumEndingEmail,
} from "@/lib/email-sequence-templates";
import {
  fractionPhrase,
  MATCHING_OPENS_IN_DAYS,
  pendingMilestone,
  PREMIUM_WARNING_DAYS,
  seatsLeft,
  type MilestoneKey,
} from "@/lib/email-sequence";
import { isEmailConfigured, sendSequenceEmail, sequenceContactEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/env";
import { COHORT_TARGET } from "@/lib/offer";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * GET/POST /api/cron/email-sequence
 *
 * The founding-circle sequence: the cohort milestones, and the warning that a
 * member's founding premium is about to lapse.
 *
 * The sixth message — the one sent when the premium has actually run out — is
 * deliberately NOT here. check-expiry is what downgrades a lapsed member, and
 * it clears subscription_end_date when it does, so by the time this job next
 * ran there would be no way left to find the people who had just expired. It
 * sends that one at the moment it performs the downgrade instead, which also
 * makes it impossible for the email and the downgrade to disagree.
 *
 * Secured by CRON_SECRET, as the other two jobs are.
 */

/** Nothing sends more than this in one run, so a mistake stays a small one. */
const BATCH = 200;

type Supabase = ReturnType<typeof createAdminClient>;

/**
 * Claims the right to send one email, by writing the ledger row first.
 *
 * The unique index on (email, template_key) is what makes the sequence safe to
 * retry: a conflicting insert means somebody already sent this and we must not.
 * Claiming BEFORE the send rather than recording after it is the important
 * part — a crash in between then costs a member one email, where the other
 * order would send them a second copy on the next run.
 */
async function claim(
  supabase: Supabase,
  row: {
    email: string;
    template_key: string;
    profile_id?: string | null;
    registration_id?: string | null;
    meta?: Record<string, unknown>;
  },
): Promise<string | null> {
  const { data, error } = await supabase
    .from("email_sends")
    .insert(row)
    .select("id")
    .single();

  // 23505 is the unique violation: already sent, which is the expected path on
  // every run after the first and is not an error worth logging.
  if (error) {
    if (error.code !== "23505") {
      console.error("email_sends claim failed:", error.code, error.message);
    }
    return null;
  }
  return data?.id ?? null;
}

/** Hands the claim back when the send fails, so the member stays eligible. */
async function release(supabase: Supabase, id: string): Promise<void> {
  const { error } = await supabase.from("email_sends").delete().eq("id", id);
  if (error) console.error("email_sends release failed:", error.message);
}

/**
 * The cohort milestones.
 *
 * Only the highest threshold the count has crossed is sent. If registrations
 * jump past two of them between runs, the later message is the true one and
 * the earlier one is stale news nobody should receive.
 */
async function runMilestones(supabase: Supabase, site: string, contactEmail: string) {
  const { count, error: countError } = await supabase
    .from("launch_registrations")
    .select("id", { count: "exact", head: true });

  if (countError || count === null) {
    return { milestone: null, sent: 0, error: countError?.message ?? "count unavailable" };
  }

  const milestone = pendingMilestone(count);
  if (!milestone) return { milestone: null, sent: 0, count };

  const { data: people, error } = await supabase
    .from("launch_registrations")
    .select("id, full_name, email")
    .limit(BATCH);

  if (error) return { milestone: milestone.key, sent: 0, count, error: error.message };

  const left = seatsLeft(count);
  const render = (firstName: string) => {
    const base = { firstName, contactEmail };
    const key: MilestoneKey = milestone.key;
    if (key === "cohort-quarter") {
      return cohortQuarterEmail({
        ...base,
        ctaUrl: `${site}/register`,
        joined: count,
        target: COHORT_TARGET,
        phrase: fractionPhrase(count),
      });
    }
    if (key === "cohort-hundred-left") {
      return cohortSeatsLeftEmail({
        ...base,
        ctaUrl: `${site}/register`,
        joined: count,
        target: COHORT_TARGET,
        left,
      });
    }
    return cohortFullEmail({
      ...base,
      ctaUrl: `${site}/signup`,
      target: COHORT_TARGET,
      days: MATCHING_OPENS_IN_DAYS,
    });
  };

  let sent = 0;
  let noAddress = 0;
  for (const person of people ?? []) {
    if (!person.email) {
      noAddress += 1;
      continue;
    }
    const claimId = await claim(supabase, {
      email: person.email,
      template_key: milestone.key,
      registration_id: person.id,
      meta: { joined: count, target: COHORT_TARGET, left },
    });
    if (!claimId) continue;

    try {
      await sendSequenceEmail(person.email, render((person.full_name ?? "").split(" ")[0] ?? ""));
      sent++;
    } catch (e) {
      console.error("milestone send failed for", person.id, e);
      await release(supabase, claimId);
    }
  }

  return { milestone: milestone.key, sent, count, considered: people?.length ?? 0, noAddress };
}

/**
 * The founding premium is within PREMIUM_WARNING_DAYS of lapsing.
 *
 * The window is "ends at any point in the next fifteen days" rather than "ends
 * in exactly fifteen days", so a run that is missed or a member created on an
 * odd day is still caught. Sending twice is prevented by the ledger, not by
 * the width of the window.
 */
async function runPremiumWarnings(supabase: Supabase, site: string, contactEmail: string) {
  const now = new Date();
  const horizon = new Date(now.getTime() + PREMIUM_WARNING_DAYS * 86_400_000);

  const { data: members, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, membership_tier, subscription_end_date")
    .eq("founding_member", true)
    .neq("membership_tier", "Basic")
    .not("subscription_end_date", "is", null)
    .gt("subscription_end_date", now.toISOString())
    .lte("subscription_end_date", horizon.toISOString())
    .limit(BATCH);

  if (error) return { sent: 0, error: error.message };

  let sent = 0;
  // Counted, not just skipped. profiles.email was null for every production
  // row and both premium emails simply `continue`d past it, so the job
  // reported success while sending nothing. A number in the response is what
  // would have made that visible.
  let noAddress = 0;
  for (const member of members ?? []) {
    if (!member.email) {
      noAddress += 1;
      continue;
    }

    const days = Math.max(
      1,
      Math.ceil((new Date(member.subscription_end_date).getTime() - now.getTime()) / 86_400_000),
    );

    const claimId = await claim(supabase, {
      email: member.email,
      template_key: "premium-ending",
      profile_id: member.id,
      meta: { days, tier: member.membership_tier, ends: member.subscription_end_date },
    });
    if (!claimId) continue;

    try {
      await sendSequenceEmail(
        member.email,
        premiumEndingEmail({
          firstName: (member.full_name ?? "").split(" ")[0] ?? "",
          ctaUrl: `${site}/membership`,
          contactEmail,
          days,
          tier: member.membership_tier,
        }),
      );
      sent++;
    } catch (e) {
      console.error("premium warning failed for", member.id, e);
      await release(supabase, claimId);
    }
  }

  return { sent, considered: members?.length ?? 0, noAddress };
}

async function run() {
  if (!isEmailConfigured()) return { note: "email not configured" };

  const supabase = createAdminClient();
  const site = getSiteUrl();
  const contactEmail = sequenceContactEmail();

  return {
    milestones: await runMilestones(supabase, site, contactEmail),
    premiumWarnings: await runPremiumWarnings(supabase, site, contactEmail),
  };
}

export async function GET(req: NextRequest) {
  const auth = cronAuth(req);
  if (!auth.ok) return cronUnauthorized(auth);
  return NextResponse.json(await run());
}

export async function POST(req: NextRequest) {
  const auth = cronAuth(req);
  if (!auth.ok) return cronUnauthorized(auth);
  return NextResponse.json(await run());
}
