/**
 * Renders every transactional email to .preview/ so they can be opened in a
 * browser and reviewed without sending anything.
 *
 *   node scripts/preview-emails.mjs
 *
 * Templates are plain functions returning { subject, html, text }, so this
 * imports them directly — no server, no API key, no risk of a real send.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Two things block a plain import of the templates:
//   - they import "server-only", which throws outside a React Server Component
//   - they use the "@/..." tsconfig path alias, which Node knows nothing about
// A small resolve hook handles both. Node 22+ strips the TypeScript itself.
const root = process.cwd().split("\\").join("/");
const hook = [
  'import { pathToFileURL } from "node:url";',
  `const ROOT = ${JSON.stringify(root)};`,
  "export async function resolve(specifier, context, next) {",
  '  if (specifier === "server-only") {',
  '    return { url: "data:text/javascript,", shortCircuit: true };',
  "  }",
  '  if (specifier.startsWith("@/")) {',
  '    // tsconfig paths are extensionless; Node requires the real filename.',
  '    let p = ROOT + "/" + specifier.slice(2);',
  '    if (!/\.(ts|tsx|js|mjs|json)$/.test(p)) p += ".ts";',
  '    return next(pathToFileURL(p).href, context);',
  "  }",
  "  return next(specifier, context);",
  "}",
].join("\n");

register(`data:text/javascript,${encodeURIComponent(hook)}`, pathToFileURL("./"));

const {
  founderWelcomeEmail,
  profileReminderEmail,
  confirmSignupEmail,
  passwordResetEmail,
  emailChangeEmail,
} = await import("../lib/email-templates.ts");

const OUT = ".preview";
/**
 * Supabase renders its own auth emails, so those templates are written out as
 * files to paste into Authentication -> Email Templates. Committed so the
 * dashboards in dev and production have a single source of truth to match.
 */
const AUTH_OUT = "supabase/auth-emails";
mkdirSync(OUT, { recursive: true });
mkdirSync(AUTH_OUT, { recursive: true });

const SITE = "https://www.pravara.ai";
const CONTACT = "care@pravara.ai";

const EMAILS = [
  {
    file: "founder-welcome.html",
    label: "Founder welcome (sent on registration)",
    render: () =>
      founderWelcomeEmail({
        firstName: "Venkata",
        ctaUrl: `${SITE}/signup?email=someone%40example.com&name=Venkata`,
        contactEmail: CONTACT,
        seatNumber: 47,
      }),
  },
  {
    file: "profile-reminder.html",
    label: "Profile reminder (cron, for registrants who never built a profile)",
    render: () =>
      profileReminderEmail({
        firstName: "Venkata",
        ctaUrl: `${SITE}/signup`,
        contactEmail: CONTACT,
      }),
  },
];

/**
 * Supabase substitutes this at send time. For a readable preview it becomes a
 * real URL; the file written to supabase/auth-emails keeps the variable.
 */
const CONFIRMATION_URL = "{{ .ConfirmationURL }}";

const AUTH_EMAILS = [
  { file: "confirm-signup.html", supabase: "Confirm signup",
    label: "Confirm signup (Supabase — the first email a member ever gets)", render: confirmSignupEmail },
  { file: "reset-password.html", supabase: "Reset Password",
    label: "Reset password (Supabase — from the login page)", render: passwordResetEmail },
  { file: "change-email.html", supabase: "Change Email Address",
    label: "Change email address (Supabase)", render: emailChangeEmail },
];

const index = [];
for (const { file, label, render } of EMAILS) {
  const { subject, html, text } = render();
  writeFileSync(`${OUT}/${file}`, html);
  writeFileSync(`${OUT}/${file.replace(/\.html$/, ".txt")}`, text);
  index.push({ file, label, subject, bytes: html.length });
  const kb = (html.length / 1024).toFixed(1);
  // Gmail clips messages over ~102KB, hiding everything past the cut behind a
  // "View entire message" link — including the footer.
  const warn = html.length > 102_000 ? "  OVER Gmail's 102KB clip limit" : "";
  console.log(`  ${file.padEnd(24)} ${kb.padStart(5)}KB  "${subject}"${warn}`);
}

for (const { file, label, supabase, render } of AUTH_EMAILS) {
  const { subject, html } = render();
  // The paste-ready template keeps the Go variables untouched.
  writeFileSync(`${AUTH_OUT}/${file}`, html);
  // The preview swaps them for something clickable so it reads like real mail.
  writeFileSync(
    `${OUT}/${file}`,
    html
      .split(CONFIRMATION_URL).join(`${SITE}/auth/confirm?token=example`)
      .split("{{ .Email }}").join("venkata@example.com")
      .split("{{ .NewEmail }}").join("raj@example.com"),
  );
  index.push({ file, label, subject, bytes: html.length });
  const kb = (html.length / 1024).toFixed(1);
  const warn = html.length > 102_000 ? "  OVER Gmail's 102KB clip limit" : "";
  console.log(`  ${file.padEnd(24)} ${kb.padStart(5)}KB  "${subject}"   -> Supabase template "${supabase}"${warn}`);
}

writeFileSync(
  `${OUT}/index.html`,
  `<h1 style="font-family:system-ui">Pravara email previews</h1><ul style="font-family:system-ui;line-height:2">` +
    index.map((e) => `<li><a href="${e.file}">${e.label}</a> — <code>${e.subject}</code></li>`).join("") +
    `</ul>`,
);

console.log(`\nOpen ${OUT}/index.html in a browser.`);
