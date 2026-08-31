import { NextRequest, NextResponse } from "next/server";

import { cronAuth, cronUnauthorized } from "@/lib/cron-auth";

import { isEmailConfigured, sendProfileReminderEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * GET/POST /api/cron/profile-reminders
 *
 * Nudges founders who reserved a seat but never created an account (status still
 * 'registered'). Capped at 2 reminders each, no sooner than 24h after sign-up and
 * 3 days apart. Secured by CRON_SECRET (Vercel Cron sends `Authorization: Bearer`).
 */

async function run() {
  if (!isEmailConfigured()) {
    return { sent: 0, note: "email not configured" };
  }

  const supabase = createAdminClient();
  const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();

  const { data, error } = await supabase
    .from("launch_registrations")
    .select("id, full_name, first_name, email, reminders_sent")
    .eq("status", "registered")
    .lt("created_at", dayAgo)
    .lt("reminders_sent", 2)
    .or(`last_reminded_at.is.null,last_reminded_at.lt.${threeDaysAgo}`)
    .limit(100);

  if (error) {
    console.error("profile-reminders query error:", error.message);
    return { sent: 0, error: error.message };
  }

  let sent = 0;
  let optedOut = 0;
  for (const r of data ?? []) {
    try {
      // Only record a reminder that actually went. The send returns false when
      // the address has opted out, and counting that as sent would spend one of
      // their two reminders on an email nobody received.
      const delivered = await sendProfileReminderEmail({
        email: r.email,
        full_name: r.full_name,
        first_name: r.first_name,
      });
      if (!delivered) {
        optedOut += 1;
        continue;
      }

      await supabase
        .from("launch_registrations")
        .update({
          reminders_sent: (r.reminders_sent ?? 0) + 1,
          last_reminded_at: new Date().toISOString(),
        })
        .eq("id", r.id);
      sent++;
    } catch (e) {
      console.error("profile reminder failed for", r.id, e);
    }
  }

  return { sent, optedOut, considered: data?.length ?? 0 };
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
