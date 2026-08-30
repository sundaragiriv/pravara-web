import { NextRequest, NextResponse } from "next/server";

import { cronAuth, cronUnauthorized } from "@/lib/cron-auth";

import { createAdminClient } from "@/lib/supabase-admin";
import { isEmailConfigured, sendSequenceEmail, sequenceContactEmail } from "@/lib/email";
import { premiumEndedEmail } from "@/lib/email-sequence-templates";
import { getSiteUrl } from "@/lib/env";

/**
 * POST /api/cron/check-expiry
 *
 * Daily cron job that auto-downgrades expired subscriptions to Basic.
 * Protected by CRON_SECRET header so only authorized callers can trigger it.
 *
 * Wired into vercel.json alongside the profile reminders. It had been written
 * but never scheduled, so expiry simply never ran — harmless while nobody could
 * pay, and a billing correctness problem the moment they can.
 */

/**
 * Vercel Cron issues a GET with `Authorization: Bearer $CRON_SECRET`. The route
 * previously exported POST only and compared the raw header against the secret,
 * so a Vercel-issued call would have failed twice over: 405 for the method, and
 * a mismatch on the "Bearer " prefix even if it had not. Matches the pattern the
 * profile-reminder cron already uses.
 */

type ExpiredMember = {
  id: string;
  full_name: string | null;
  email: string | null;
  membership_tier: string;
  founding_member: boolean | null;
};

/**
 * "Your 3 months are up" — the conversion email, sent only to founding members.
 *
 * A member who paid for Gold and let it lapse should not be told their founding
 * premium ended, so this is scoped to founding_member. Everyone else still gets
 * the in-app notification above.
 */
async function sendExpiryEmails(
  supabase: ReturnType<typeof createAdminClient>,
  expired: ExpiredMember[],
): Promise<number> {
  if (!isEmailConfigured()) return 0;

  const site = getSiteUrl();
  const contactEmail = sequenceContactEmail();
  let sent = 0;
  let noAddress = 0;

  for (const member of expired) {
    if (!member.founding_member) continue;
    if (!member.email) {
      // Was silently true for every production profile until the email column
      // was backfilled. Logged rather than swallowed.
      noAddress += 1;
      console.warn("premium-ended skipped, no address on profile", member.id);
      continue;
    }

    // Claim before sending; a unique violation (23505) means it already went.
    const { data: claim, error: claimError } = await supabase
      .from("email_sends")
      .insert({
        email: member.email,
        template_key: "premium-ended",
        profile_id: member.id,
        meta: { tier: member.membership_tier },
      })
      .select("id")
      .single();

    if (claimError) {
      if (claimError.code !== "23505") {
        console.error("premium-ended claim failed:", claimError.code, claimError.message);
      }
      continue;
    }

    try {
      await sendSequenceEmail(
        member.email,
        premiumEndedEmail({
          firstName: (member.full_name ?? "").split(" ")[0] ?? "",
          ctaUrl: `${site}/membership`,
          contactEmail,
          tier: member.membership_tier,
        }),
      );
      sent++;
    } catch (e) {
      console.error("premium-ended send failed for", member.id, e);
      // Hand the claim back so the member stays eligible on the next run.
      await supabase.from("email_sends").delete().eq("id", claim.id);
    }
  }

  if (noAddress) console.warn(`premium-ended: ${noAddress} founding member(s) had no address`);
  return sent;
}

async function run() {
  // Service role, so this bypasses RLS. createAdminClient throws when the
  // environment is missing rather than asserting the variables are present and
  // failing later with an opaque error from the client.
  const supabase = createAdminClient();

  // Find all non-Basic users whose subscription has expired
  const { data: expired, error: fetchError } = await supabase
    .from("profiles")
    .select("id, full_name, email, membership_tier, founding_member")
    .neq("membership_tier", "Basic")
    .not("subscription_end_date", "is", null)
    .lt("subscription_end_date", new Date().toISOString());

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (!expired || expired.length === 0) {
    return { message: "No expired subscriptions", downgraded: 0 };
  }

  const expiredIds = expired.map((p) => p.id);

  // Downgrade all expired users to Basic
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      membership_tier: "Basic",
      subscription_billing: null,
      subscription_start_date: null,
      subscription_end_date: null,
    })
    .in("id", expiredIds);

  if (updateError) {
    return { error: updateError.message };
  }

  // The notifications table has `content`, not `title`/`message` — this insert
  // named columns that do not exist, so every downgrade notification failed and
  // the try/catch swallowed it. Members were being moved to Basic with no word.
  const notifications = expired.map((p) => ({
    user_id: p.id,
    type: "membership_expired",
    content: `Your ${p.membership_tier} membership has ended. You are now on the Basic plan.`,
    is_read: false,
  }));

  const { error: notifyError } = await supabase.from("notifications").insert(notifications);
  if (notifyError) {
    // Still non-fatal — the downgrade itself is the job. But it is logged now
    // rather than discarded, which is how this went unnoticed.
    console.error("Expiry notifications failed:", notifyError.message);
  }

  // The last email in the founding sequence is sent from here rather than from
  // the sequence cron, because the update above clears subscription_end_date —
  // once it has run there is no longer any way to find the members who just
  // expired. Sending it at the moment of the downgrade also means the email and
  // the account state can never disagree.
  //
  // It is claimed through the same email_sends ledger as the rest of the
  // sequence, so a retried cron run cannot send it twice.
  const emailed = await sendExpiryEmails(supabase, expired);

  return {
    message: `Downgraded ${expiredIds.length} expired subscription(s)`,
    downgraded: expiredIds.length,
    emailed,
    users: expired.map((p) => ({ id: p.id, name: p.full_name, was: p.membership_tier })),
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