import { NextResponse } from "next/server";

import { reportRequestSchema } from "@/lib/api-schemas";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/ratelimit";
import { sanitizePlainText } from "@/lib/sanitize";
import { createClient } from "@/utils/supabase/server";

/**
 * Report a member to the team.
 *
 * A report always also blocks, unless the reporter opts out. Someone who has
 * just described harassment should not have to take a second action to stop
 * hearing from the person, and should certainly not keep seeing them in their
 * matches while the report sits in a queue.
 *
 * The reporter is told their report was received and nothing further. What was
 * decided is not theirs to see — a reporter who learns an account was actioned
 * knows exactly who to attribute it to, and retaliation is the risk we are
 * trying to remove.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await enforceRateLimit(request, RATE_LIMITS.safety, `user:${user.id}`);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const parsed = reportRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please choose a reason for reporting." },
      { status: 400 },
    );
  }

  const { profile_id, reason, detail, alsoBlock } = parsed.data;

  if (profile_id === user.id) {
    return NextResponse.json({ error: "You cannot report yourself." }, { status: 400 });
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_id: profile_id,
    reason,
    detail: detail ? sanitizePlainText(detail) : null,
  });

  if (error) {
    console.error("Report failed:", error.message, `[code: ${error.code ?? "?"}]`);
    return NextResponse.json(
      { error: "Could not submit that report. Please try again." },
      { status: 500 },
    );
  }

  let blocked = false;
  if (alsoBlock) {
    const { error: blockError } = await supabase
      .from("blocks")
      .insert({ blocker_id: user.id, blocked_id: profile_id });

    // 23505 is "already blocked", which is the outcome we wanted anyway. Any
    // other failure is logged but does not fail the request — the report is the
    // part that must not be lost, and telling someone their report failed when
    // it did not would be worse than a missing block they can redo.
    blocked = !blockError || blockError.code === "23505";
    if (blockError && blockError.code !== "23505") {
      console.error("Block-on-report failed:", blockError.message);
    }
  }

  return NextResponse.json({ ok: true, blocked });
}
