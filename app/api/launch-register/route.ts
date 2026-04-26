import { NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";

import { launchRegistrationSchema } from "@/lib/api-schemas";
import { isEmailConfigured, sendLaunchRegistrationEmails } from "@/lib/email";
import { createLaunchRegistration } from "@/lib/launch";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/ratelimit";
import { sanitizePlainText } from "@/lib/sanitize";

function isDuplicateRegistrationError(error: unknown): boolean {
  const candidate = error as PostgrestError | undefined;
  return candidate?.code === "23505";
}

export async function POST(request: Request) {
  const rateLimit = await enforceRateLimit(request, RATE_LIMITS.launchRegister);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please wait before trying again." },
      { status: 429, headers: rateLimit.headers },
    );
  }

  try {
    const payload = launchRegistrationSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json(
        { error: "Invalid registration payload." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const sanitizedInput = {
      ...payload.data,
      full_name: sanitizePlainText(payload.data.full_name),
      profession: sanitizePlainText(payload.data.profession),
      location: sanitizePlainText(payload.data.location),
      email: sanitizePlainText(payload.data.email).toLowerCase(),
      phone: sanitizePlainText(payload.data.phone),
      source: sanitizePlainText(payload.data.source || "launch-homepage"),
    };

    await createLaunchRegistration(sanitizedInput);

    if (isEmailConfigured()) {
      try {
        await sendLaunchRegistrationEmails(sanitizedInput);
      } catch (emailError) {
        console.error("Launch registration email error:", emailError);
      }
    }

    return NextResponse.json(
      { ok: true, message: "You are on the founding list." },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    if (isDuplicateRegistrationError(error)) {
      return NextResponse.json(
        { error: "This email is already on the founding list." },
        { status: 409, headers: rateLimit.headers },
      );
    }

    console.error("Launch registration route error:", error);
    return NextResponse.json(
      { error: "Unable to complete registration right now." },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
