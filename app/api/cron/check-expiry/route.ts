import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return (
    req.headers.get("authorization") === `Bearer ${secret}` ||
    req.headers.get("x-cron-secret") === secret
  );
}

async function run() {
  // Use service role key for admin-level access (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Find all non-Basic users whose subscription has expired
  const { data: expired, error: fetchError } = await supabase
    .from("profiles")
    .select("id, full_name, membership_tier")
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

  return {
    message: `Downgraded ${expiredIds.length} expired subscription(s)`,
    downgraded: expiredIds.length,
    users: expired.map((p) => ({ id: p.id, name: p.full_name, was: p.membership_tier })),
  };
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await run());
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await run());
}