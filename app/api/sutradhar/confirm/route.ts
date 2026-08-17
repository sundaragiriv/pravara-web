import { NextResponse } from "next/server";

import { sutradharConfirmSchema } from "@/lib/api-schemas";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/ratelimit";
import { sanitizeProfileValue } from "@/lib/sanitize";
import { FIELD_LABELS, checkFieldValue, isEditableField } from "@/lib/sutradhar-fields";
import { createClient } from "@/utils/supabase/server";

/**
 * The only route that writes a profile change on the assistant's behalf, and it
 * runs only after the member has seen the change and pressed confirm.
 *
 * It deliberately re-validates everything rather than trusting the proposal it
 * handed out a moment earlier. The client is free to post whatever it likes
 * here, so the allow-list and the canonical-value check have to be applied
 * again on the way in — a proposal is a suggestion, not a capability.
 *
 * The write is scoped to the caller's own row and goes through the
 * request-scoped Supabase client, so row-level security applies as it would
 * anywhere else.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit(request, RATE_LIMITS.sutradhar, `user:${user.id}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: rateLimit.headers }
      );
    }

    const payload = sutradharConfirmSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { field, value } = payload.data;

    if (!isEditableField(field)) {
      return NextResponse.json(
        { reply: "That is not a field I can change from here." },
        { status: 400 }
      );
    }

    const checked = checkFieldValue(field, value);
    if (!checked.ok) {
      return NextResponse.json({ reply: checked.reason }, { status: 400 });
    }

    const cleanValue = sanitizeProfileValue(checked.value);

    const { error } = await supabase
      .from("profiles")
      .update({ [field]: cleanValue })
      .eq("id", user.id);

    if (error) {
      console.error("Sutradhar confirm error:", error.message);
      return NextResponse.json(
        { reply: "I could not save that just now. Please try again in a moment." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply: `Saved. Your ${FIELD_LABELS[field]} is now "${cleanValue}".`,
    });
  } catch (error) {
    console.error(
      "Sutradhar confirm error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { reply: "I could not save that just now. Please try again in a moment." },
      { status: 500 }
    );
  }
}
