import { NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";

import { launchRegistrationSchema } from "@/lib/api-schemas";
import { isEmailConfigured, sendLaunchRegistrationEmails } from "@/lib/email";
import { recordLaunchEvent } from "@/lib/launch-analytics";
import { createLaunchRegistration, getSeatNumber } from "@/lib/launch";
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
      profession: payload.data.profession ? sanitizePlainText(payload.data.profession) : "",
      location: payload.data.location ? sanitizePlainText(payload.data.location) : "",
      email: sanitizePlainText(payload.data.email).toLowerCase(),
      phone: sanitizePlainText(payload.data.phone),
      source: sanitizePlainText(payload.data.source || "launch-homepage"),
    };

    const registration = await createLaunchRegistration(sanitizedInput);
    await recordLaunchEvent({
      event: "launch_registration_completed",
      path: "/register",
      source: sanitizedInput.source,
      metadata: {
        age: sanitizedInput.age,
        gender: sanitizedInput.gender,
        location: sanitizedInput.location,
      },
    });

    if (isEmailConfigured()) {
      try {
        // Null on failure — the welcome email drops the line rather than
        // stating a seat number it is not sure of.
        const seatNumber = registration?.id ? await getSeatNumber(registration.id) : null;
        await sendLaunchRegistrationEmails(sanitizedInput, seatNumber ?? undefined);
      } catch (emailError) {
        console.error("Launch registration email error:", emailError);
      }
    } else {
      // Loud, because the form promises a confirmation email. This silently
      // returned ok:true for every real registration until 2026-07-30.
      console.error(
        "REGISTRATION EMAIL NOT SENT — email is not configured. Set RESEND_API_KEY and EMAIL_FROM.",
      );
    }

    return NextResponse.json(
      { ok: true, message: "You are on the Founder Circle list." },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    if (isDuplicateRegistrationError(error)) {
      return NextResponse.json(
        { error: "This email is already on the Founder Circle list.", alreadyRegistered: true },
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
