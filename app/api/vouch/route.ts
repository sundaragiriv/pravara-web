import { NextResponse } from "next/server";

import { vouchRequestSchema } from "@/lib/api-schemas";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/ratelimit";
import { sanitizePlainText } from "@/lib/sanitize";
import { createAdminClient } from "@/lib/supabase-admin";

/**
 * POST /api/vouch — public endorsement submission (family/friends, no login).
 * Hardened path: rate-limited + validated + the target profile must exist, then
 * inserted via the service-role client. Direct client inserts into `endorsements`
 * are blocked by RLS, so this route is the only way in.
 */
export async function POST(request: Request) {
  const rateLimit = await enforceRateLimit(request, RATE_LIMITS.vouch);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many vouches from here. Please wait a little while." },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const parsed = vouchRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fill in your name and a short endorsement." },
      { status: 400, headers: rateLimit.headers },
    );
  }

  const supabase = createAdminClient();

  // Don't allow vouches for arbitrary / non-existent profile ids.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", parsed.data.profile_id)
    .single();
  if (!profile) {
    return NextResponse.json(
      { error: "That profile could not be found." },
      { status: 404, headers: rateLimit.headers },
    );
  }

  const { error } = await supabase.from("endorsements").insert({
    profile_id: parsed.data.profile_id,
    endorser_name: sanitizePlainText(parsed.data.endorser_name),
    relation: parsed.data.relation,
    comment: sanitizePlainText(parsed.data.comment),
  });

  if (error) {
    console.error("Vouch insert error:", error);
    return NextResponse.json(
      { error: "Could not submit your vouch right now. Please try again." },
      { status: 500, headers: rateLimit.headers },
    );
  }

  return NextResponse.json({ ok: true }, { headers: rateLimit.headers });
}
