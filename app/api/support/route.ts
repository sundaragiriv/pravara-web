import { NextResponse } from "next/server";

import { supportRequestSchema } from "@/lib/api-schemas";
import { isEmailConfigured, sendSupportRequestEmails } from "@/lib/email";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/ratelimit";
import { sanitizePlainText } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const rateLimit = await enforceRateLimit(request, RATE_LIMITS.support);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many support requests. Please wait before trying again." },
        { status: 429, headers: rateLimit.headers },
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: "Support email is not configured yet." },
        { status: 503, headers: rateLimit.headers },
      );
    }

    const payload = supportRequestSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json(
        { error: "Invalid support request payload." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const sanitizedPayload = {
      ...payload.data,
      name: sanitizePlainText(payload.data.name),
      email: sanitizePlainText(payload.data.email),
      subject: sanitizePlainText(payload.data.subject),
      message: sanitizePlainText(payload.data.message),
    };

    await sendSupportRequestEmails(sanitizedPayload);

    return NextResponse.json({ ok: true }, { headers: rateLimit.headers });
  } catch (error) {
    console.error("Support route error:", error);
    return NextResponse.json({ error: "Unable to send support request." }, { status: 500 });
  }
}
