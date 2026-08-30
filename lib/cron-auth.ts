import "server-only";

import { NextRequest, NextResponse } from "next/server";

/**
 * Shared authorisation for the scheduled jobs.
 *
 * This check existed three times, copy-pasted, in profile-reminders,
 * check-expiry and email-sequence. One copy now.
 *
 * The diagnostic on rejection is the point of pulling it out. A bare 401
 * cannot tell you whether CRON_SECRET is missing from the environment or
 * merely different from what arrived, and the two have completely different
 * fixes. Diagnosing that from outside cost several rounds of guessing at
 * quotes and environment scopes; this answers it in one call.
 *
 * It reports whether the variable is set and how many characters each side is,
 * never any part of the value. A length is not a secret, and without it there
 * is no way to spot the usual mistakes — a pasted `CRON_SECRET=` prefix, or
 * wrapping quotes Vercel treats as part of the value.
 */
export type CronAuthResult =
  | { ok: true }
  | {
      ok: false;
      diagnostic: {
        /** Is CRON_SECRET present in this deployment's environment at all? */
        secretConfigured: boolean;
        secretLength: number;
        /** Did the caller send an Authorization or x-cron-secret header? */
        headerPresent: boolean;
        headerScheme: string | null;
        credentialLength: number;
        hint: string;
      };
    };

function describe(secret: string | undefined, req: NextRequest) {
  const auth = req.headers.get("authorization");
  const alt = req.headers.get("x-cron-secret");
  const credential = auth?.startsWith("Bearer ") ? auth.slice(7) : (alt ?? "");
  const secretLength = secret?.length ?? 0;
  const credentialLength = credential.length;

  let hint: string;
  if (!secret) {
    hint =
      "CRON_SECRET is not set in this deployment. Add it in Vercel under " +
      "Settings > Environment Variables with Production ticked, then redeploy — " +
      "variables are baked in at build time and do not apply to existing deployments.";
  } else if (!auth && !alt) {
    hint = "No Authorization or x-cron-secret header arrived with this request.";
  } else if (credentialLength === secretLength + "CRON_SECRET=".length) {
    hint =
      "The credential is exactly the secret plus 'CRON_SECRET=' — the whole " +
      "line was pasted into Vercel rather than just the value.";
  } else if (credentialLength === secretLength + 2) {
    hint =
      "The credential is two characters longer than the secret, which is what " +
      "wrapping quotes look like. Vercel treats quotes as part of the value.";
  } else if (credentialLength !== secretLength) {
    hint = `Lengths differ: this deployment holds ${secretLength} characters, the caller sent ${credentialLength}.`;
  } else {
    hint = "Same length, different value — the two secrets are simply not the same string.";
  }

  return {
    secretConfigured: Boolean(secret),
    secretLength,
    headerPresent: Boolean(auth || alt),
    headerScheme: auth ? auth.split(" ")[0] : alt ? "x-cron-secret" : null,
    credentialLength,
    hint,
  };
}

export function cronAuth(req: NextRequest): CronAuthResult {
  const secret = process.env.CRON_SECRET;

  if (secret) {
    const auth = req.headers.get("authorization");
    const alt = req.headers.get("x-cron-secret");
    if (auth === `Bearer ${secret}` || alt === secret) return { ok: true };
  }

  return { ok: false, diagnostic: describe(secret, req) };
}

/** The 401 every job returns, carrying the diagnostic. */
export function cronUnauthorized(result: Extract<CronAuthResult, { ok: false }>) {
  return NextResponse.json({ error: "Unauthorized", ...result.diagnostic }, { status: 401 });
}
