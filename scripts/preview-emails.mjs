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

// The templates are TypeScript; Node 22+ strips types natively, but the module
// also imports "server-only" which throws outside a React Server Component.
// Stub it before loading anything.
register(
  "data:text/javascript,export async function resolve(s,c,n){if(s===\"server-only\")return{url:\"data:text/javascript,\",shortCircuit:true};return n(s,c)}",
  pathToFileURL("./"),
);

const { founderWelcomeEmail, profileReminderEmail } = await import("../lib/email-templates.ts");

const OUT = ".preview";
mkdirSync(OUT, { recursive: true });

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

const index = [];
for (const { file, label, render } of EMAILS) {
  const { subject, html, text } = render();
  writeFileSync(`${OUT}/${file}`, html);
  writeFileSync(`${OUT}/${file.replace(/\.html$/, ".txt")}`, text);
  index.push({ file, label, subject, htmlBytes: html.length, textLines: text.split("\n").length });
  console.log(`  ${file.padEnd(24)} "${subject}"`);
}

// Gmail clips messages over ~102KB, hiding everything after the cut behind a
// "View entire message" link — including the unsubscribe footer.
for (const e of index) {
  const kb = (e.htmlBytes / 1024).toFixed(1);
  const warn = e.htmlBytes > 102_000 ? "  ⚠ over Gmail's 102KB clipping limit" : "";
  console.log(`  ${e.file.padEnd(24)} ${kb}KB html, ${e.textLines} lines text${warn}`);
}

writeFileSync(
  `${OUT}/index.html`,
  `<h1 style="font-family:system-ui">Pravara email previews</h1><ul style="font-family:system-ui;line-height:2">` +
    index.map((e) => `<li><a href="${e.file}">${e.label}</a> — <code>${e.subject}</code></li>`).join("") +
    `</ul>`,
);

console.log(`\nOpen ${OUT}/index.html in a browser.`);
