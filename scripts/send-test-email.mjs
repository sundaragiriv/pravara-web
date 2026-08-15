/**
 * Sends a real transactional email to a chosen address, for reviewing a
 * template in an actual inbox rather than a browser preview.
 *
 *   node scripts/send-test-email.mjs welcome  care@pravara.ai
 *   node scripts/send-test-email.mjs reminder care@pravara.ai
 *
 * Goes straight to Resend, bypassing the registration flow — so it does not
 * create a row, does not trip the duplicate-email check, and can be run
 * repeatedly against the same address while iterating on a design.
 */

import { readFileSync } from "node:fs";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Same two obstacles as the preview script: "server-only" throws outside a
// React Server Component, and Node cannot resolve the "@/" tsconfig alias.
const root = process.cwd().split("\\").join("/");
const hook = [
  'import { pathToFileURL } from "node:url";',
  `const ROOT = ${JSON.stringify(root)};`,
  "export async function resolve(specifier, context, next) {",
  '  if (specifier === "server-only") {',
  '    return { url: "data:text/javascript,", shortCircuit: true };',
  "  }",
  '  if (specifier.startsWith("@/")) {',
  '    let p = ROOT + "/" + specifier.slice(2);',
  '    if (!/\\.(ts|tsx|js|mjs|json)$/.test(p)) p += ".ts";',
  "    return next(pathToFileURL(p).href, context);",
  "  }",
  "  return next(specifier, context);",
  "}",
].join("\n");
register(`data:text/javascript,${encodeURIComponent(hook)}`, pathToFileURL("./"));

function readEnv(file) {
  const out = {};
  try {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* file may not exist */
  }
  return out;
}

// Dev first so a test send never uses the production key by accident.
const env = { ...readEnv(".env.local"), ...readEnv(".env.development.local") };
const KEY = env.RESEND_API_KEY;
const FROM = env.EMAIL_FROM;

if (!KEY || !FROM) {
  console.error("Missing RESEND_API_KEY or EMAIL_FROM.");
  process.exit(1);
}

const [which = "welcome", to = "care@pravara.ai"] = process.argv.slice(2);

const { founderWelcomeEmail, profileReminderEmail } = await import("../lib/email-templates.ts");

const SITE = env.NEXT_PUBLIC_SITE_URL || "https://www.pravara.ai";
const CONTACT = "care@pravara.ai";

const mail =
  which === "reminder"
    ? profileReminderEmail({ firstName: "Meera", ctaUrl: `${SITE}/signup`, contactEmail: CONTACT })
    : founderWelcomeEmail({
        firstName: "Meera",
        ctaUrl: `${SITE}/signup?email=${encodeURIComponent(to)}&name=Meera`,
        contactEmail: CONTACT,
        seatNumber: 94,
      });

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ from: FROM, to: [to], subject: mail.subject, html: mail.html, text: mail.text }),
});

const body = await res.json();
if (!res.ok) {
  console.error(`Send failed (${res.status}):`, JSON.stringify(body));
  process.exit(1);
}

console.log(`Sent "${mail.subject}"`);
console.log(`  to      ${to}`);
console.log(`  from    ${FROM}`);
console.log(`  id      ${body.id}`);
console.log(`  logo    ${SITE}/email-logo.png`);
