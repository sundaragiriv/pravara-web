import { NextResponse } from "next/server";

import { launchAnalyticsEventSchema } from "@/lib/api-schemas";
import { recordLaunchEvent } from "@/lib/launch-analytics";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/ratelimit";
import { sanitizePlainText } from "@/lib/sanitize";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const payload = launchAnalyticsEventSchema.safeParse(body);

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid analytics payload." }, { status: 400 });
  }

  const rateLimit = await enforceRateLimit(
    request,
    RATE_LIMITS.launchAnalytics,
    payload.data.session_id || null,
  );

  if (!rateLimit.success) {
    return NextResponse.json({ ok: true }, { headers: rateLimit.headers });
  }

  await recordLaunchEvent({
    event: payload.data.event,
    path: sanitizePlainText(payload.data.path),
    source: payload.data.source ? sanitizePlainText(payload.data.source) : undefined,
    sessionId: payload.data.session_id ? sanitizePlainText(payload.data.session_id) : undefined,
  });

  return NextResponse.json({ ok: true }, { headers: rateLimit.headers });
}
