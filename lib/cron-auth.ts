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
        /** Names of injected variables containing "CRON". Names only. */
        cronEnvKeysPresent: string[];
        /** Proof that environment injection works at all in this deployment. */
        otherEnvKeys: string[];
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
    /**
     * Names only, never values, and only names containing "CRON".
     *
     * After the variable was added, ticked for Production and redeployed twice,
     * the runtime still reported it absent. At that point the value cannot be
     * the problem and the name has to be — a typo, a trailing space, an
     * underscore that is a hyphen. Printing the names Vercel actually injected
     * settles it in one call. `otherEnvKeys` proves environment injection is
     * working at all, so an empty list means "this name is not there" rather
     * than "nothing is there".
     */
    cronEnvKeysPresent: Object.keys(process.env).filter((k) => /CRON/i.test(k)),
    otherEnvKeys: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "RESEND_API_KEY",
      "EMAIL_FROM",
      "PRE_LAUNCH_ENABLED",
    ].filter((k) => Boolean(process.env[k])),
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

/**
 * The 401 every job returns.
 *
 * The diagnostic goes to the server log, not to the caller. These routes are
 * publicly reachable, and while it was briefly returned in the response body —
 * which is what finally found an empty CRON_SECRET after several rounds of
 * guessing — it also told anyone who asked which environment variables exist
 * and how long the secret is. That is a reasonable trade for ten minutes of
 * debugging and a bad one to leave standing.
 *
 * Vercel captures console output per invocation, so the same information is one
 * click away under the function's logs, for whoever can already see them.
 */
export function cronUnauthorized(result: Extract<CronAuthResult, { ok: false }>) {
  console.warn("cron auth rejected:", JSON.stringify(result.diagnostic));
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
