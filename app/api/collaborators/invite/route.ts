import { NextResponse } from "next/server";

import { collaboratorInviteSchema } from "@/lib/api-schemas";
import { sendGuardianInviteEmail } from "@/lib/email";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/ratelimit";
import { createClient } from "@/utils/supabase/server";

/**
 * Invite someone to help with your search.
 *
 * The old flow inserted the row from the browser and told the member "Invite
 * sent!" while sending nothing at all. The person invited had no way of knowing
 * unless they happened to sign in and open Kutumba, so most invitations simply
 * sat there unanswered.
 *
 * The row is still written through the caller's own client, so the RLS policy
 * (`user_id = auth.uid()`) is what decides whether it may exist. This route
 * exists to send the email afterwards.
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
      { error: "Too many invitations. Please wait a little while." },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const parsed = collaboratorInviteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const { email, role } = parsed.data;

  if (email.toLowerCase() === user.email?.toLowerCase()) {
    return NextResponse.json({ error: "You cannot invite yourself." }, { status: 400 });
  }

  const { data: row, error } = await supabase
    .from("collaborators")
    .insert({ user_id: user.id, collaborator_email: email, role, status: "pending" })
    .select("id")
    .single();

  if (error) {
    // Already invited. From the member's side the intent is satisfied, so this
    // is not worth an error — but we do not send a second email.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadyInvited: true });
    }
    console.error("Collaborator invite failed:", error.message, `[${error.code ?? "?"}]`);
    return NextResponse.json({ error: "Could not send that invitation." }, { status: 500 });
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  try {
    await sendGuardianInviteEmail({
      email,
      inviterName: me?.full_name || "A member of your family",
      role,
    });
  } catch (mailError) {
    // The invitation exists and will show in Kutumba either way, so a mail
    // failure must not undo it. Logged rather than swallowed.
    console.error(
      "Guardian invite email failed:",
      mailError instanceof Error ? mailError.message : String(mailError),
    );
    return NextResponse.json({ ok: true, id: row.id, emailed: false });
  }

  return NextResponse.json({ ok: true, id: row.id, emailed: true });
}
