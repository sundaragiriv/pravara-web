import { NextResponse } from "next/server";

import { blockRequestSchema } from "@/lib/api-schemas";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/ratelimit";
import { createClient } from "@/utils/supabase/server";

/**
 * Block and unblock.
 *
 * Blocking is silent — the other person is never told, and never sees a
 * difference beyond the profile no longer being there. Telling someone they
 * have been blocked is how a block turns into a confrontation, which is the
 * opposite of what the member asked for.
 *
 * Writes go through the caller's own client so row-level security applies:
 * `blocks_insert` only permits rows where `blocker_id = auth.uid()`.
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

  const parsed = blockRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (parsed.data.profile_id === user.id) {
    return NextResponse.json({ error: "You cannot block yourself." }, { status: 400 });
  }

  const { error } = await supabase
    .from("blocks")
    .insert({ blocker_id: user.id, blocked_id: parsed.data.profile_id });

  // Already blocked. The member's intent is satisfied either way, so this is a
  // success from where they are standing.
  if (error && error.code === "23505") {
    return NextResponse.json({ ok: true, alreadyBlocked: true });
  }

  if (error) {
    console.error("Block failed:", error.message, `[code: ${error.code ?? "?"}]`);
    return NextResponse.json(
      { error: "Could not block right now. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
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

  const parsed = blockRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", parsed.data.profile_id);

  if (error) {
    console.error("Unblock failed:", error.message);
    return NextResponse.json(
      { error: "Could not unblock right now. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
