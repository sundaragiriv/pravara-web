import "server-only";

import { COHORT_TARGET, FOUNDER_PREMIUM_MONTHS } from "@/lib/offer";

/**
 * Transactional email, built to read as an invitation card rather than a
 * product notification.
 *
 * Constraints that shape every decision here:
 *  - Tables and inline styles only. Gmail strips <style>, <svg> and most
 *    modern CSS, so ornament is built from borders and typography.
 *  - Light ground, not the site's near-black. A dark email is a coin flip
 *    across clients and inverts badly in Gmail's dark mode; cream is also the
 *    truer reference for a printed wedding invitation.
 *  - Georgia for ceremony, Arial for anything that must stay legible at small
 *    sizes. No webfonts — they simply do not load in most clients.
 */
// The site's own tokens, so the email and pravara.ai are recognisably the same
// thing. haldi gold on stone-950; kumkum for the blessing.
const GOLD = "#E8C56B";        // haldi-200, the site's brightest gold
const GOLD_DEEP = "#C9A24A";   // gold.DEFAULT — rules and ornament
const KUMKUM = "#D08C6A";      // lifted off kumkum-900 for contrast on dark
const GROUND = "#0C0A09";      // stone-950, the site background
const CARD = "#12100E";        // a shade above the ground, as the site's cards are
const INK = "#F5F0E6";         // warm off-white, not pure #fff
const MUTED = "#A8A29E";       // stone-400
const RULE = "#2A231E";
/** The logo's own matte, so the header band shows no seam around the mark. */
const MATTE = "#040609";

/** Email cannot resolve relative URLs, and the logo must come from the verified
 *  sending domain or clients are likelier to block it. */
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.pravara.ai";

/**
 * The toran: a garland strung above a doorway to mark an auspicious threshold.
 *
 * Uses the ◆ glyph rather than CSS-rotated squares. Gmail strips `transform`,
 * so rotate(45deg) diamonds rendered as plain rectangles — verified in a real
 * Gmail message. A character survives everywhere a font does.
 */
function toran(): string {
  const gem = (size: number, color: string) =>
    `<td style="padding:0 6px;font-family:Arial,Helvetica,sans-serif;font-size:${size}px;line-height:1;color:${color};">&#9670;</td>`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
    <tr>
      <td style="width:56px;border-bottom:1px solid ${GOLD_DEEP};font-size:0;line-height:0;">&nbsp;</td>
      ${gem(7, GOLD_DEEP)}
      ${gem(11, GOLD)}
      ${gem(7, GOLD_DEEP)}
      <td style="width:56px;border-bottom:1px solid ${GOLD_DEEP};font-size:0;line-height:0;">&nbsp;</td>
    </tr>
  </table>`;
}

function shell(opts: { preheader: string; body: string; contactEmail: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark light">
<title>Pravara</title>
</head>
<body style="margin:0;padding:0;background:${GROUND};">
<span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${opts.preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${GROUND}" style="background:${GROUND};">
  <tr><td align="center" style="padding:36px 16px;">

    <!-- Double rule: the outer keyline and inner card echo the border of a
         printed invitation, which is the whole reason for the extra table. -->
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" bgcolor="${CARD}" style="max-width:600px;width:100%;background:${CARD};border:2px solid ${GOLD_DEEP};border-radius:4px;">
      <tr><td style="padding:5px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${RULE};border-radius:2px;">

          <!-- Full-bleed header band: the logo image spans the card width so
               its dark matte meets the edges rather than floating in a box. -->
          <tr><td align="center" bgcolor="${MATTE}" style="padding:0;font-size:0;line-height:0;background:${MATTE};">
            <img src="${SITE}/email-logo.png" width="600" height="330" alt="PRAVARA — Modern Heritage Matrimony"
                 style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;font-family:Georgia,serif;font-size:22px;letter-spacing:7px;color:${GOLD};">
          </td></tr>

          <tr><td style="padding:28px 44px 40px;font-family:Georgia,'Times New Roman',serif;color:${INK};">
            ${opts.body}
          </td></tr>

          <tr><td align="center" style="padding:0 44px 30px;">
            ${toran()}
          </td></tr>

          <tr><td style="padding:20px 40px 26px;background:${GROUND};border-top:1px solid ${RULE};font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED};text-align:center;line-height:1.7;">
            You are receiving this because you reserved a seat in the Pravara founding circle.<br>
            Reply to this message, or write to <a href="mailto:${opts.contactEmail}" style="color:${GOLD};text-decoration:none;">${opts.contactEmail}</a> — a person reads it.
          </td></tr>

        </table>
      </td></tr>
    </table>

  </td></tr>
</table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:30px auto 6px;">
    <tr><td align="center" bgcolor="${GOLD}" style="border-radius:999px;">
      <a href="${href}" style="display:inline-block;padding:16px 38px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;letter-spacing:1.5px;color:#0C0A09;text-decoration:none;border-radius:999px;">${label}</a>
    </td></tr></table>`;
}

/** A blessing, set the way it would be spoken — script, sound, then meaning. */
function blessing(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0 8px;">
    <tr><td align="center" bgcolor="${GROUND}" style="padding:22px 20px;background:${GROUND};border-left:2px solid ${GOLD_DEEP};border-right:2px solid ${GOLD_DEEP};">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:${KUMKUM};line-height:1.6;">&#x0965; &#x0936;&#x0941;&#x092D;&#x092E;&#x0938;&#x094D;&#x0924;&#x0941; &#x0965;</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;font-style:italic;color:${GOLD};letter-spacing:1px;margin-top:8px;">shubham astu</div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED};margin-top:6px;">may it be auspicious</div>
    </td></tr>
  </table>`;
}

/** "the 47th of 1,000" — real, specific, and quietly scarce. */
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export type FounderWelcomeOptions = {
  firstName: string;
  ctaUrl: string;
  contactEmail: string;
  /** Position in the founding circle. Omitted rather than guessed if unknown. */
  seatNumber?: number;
};

/** Sent the moment a founder reserves their seat. */
export function founderWelcomeEmail(opts: FounderWelcomeOptions) {
  const name = opts.firstName?.trim() || "friend";

  // Only claimed when we actually know it — an invented seat number would be
  // the one detail in this email a reader could catch us inventing.
  const seatLine = opts.seatNumber
    ? `<p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:${MUTED};margin:0 0 22px;">
         Yours is the <strong style="color:${GOLD};font-size:15px;">${ordinal(opts.seatNumber)}</strong> of ${COHORT_TARGET.toLocaleString()} seats.
       </p>`
    : "";

  const body = `
    <p style="font-family:Georgia,serif;font-size:17px;color:${MUTED};margin:0 0 6px;font-style:italic;">Namaste ${name},</p>

    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:29px;line-height:1.3;color:${INK};margin:14px 0 0;font-weight:400;">
      Your seat in the founding circle is reserved.
    </h1>

    <div style="height:1px;width:48px;background:${GOLD};opacity:.6;margin:22px 0;"></div>

    ${seatLine}

    <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:${MUTED};margin:0 0 18px;">
      Our grandparents did this with a notebook and a network of people who knew the family.
      That network thinned as we scattered. Pravara is our attempt to rebuild it — the same
      questions about gotra, lineage and character, asked with the same care.
    </p>

    <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:${MUTED};margin:0 0 18px;">
      What would help most now is your profile. Not a form — a conversation with Narada, our
      AI, which asks the things an elder would ask and writes it up for you. About three minutes.
    </p>

    <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:${MUTED};margin:0;">
      Founders who finish are matched <strong style="color:${INK};">before anyone else</strong> when we
      open, and keep <strong style="color:${GOLD};">${FOUNDER_PREMIUM_MONTHS} months of premium, free</strong>.
    </p>

    ${button(opts.ctaUrl, "BUILD MY PROFILE")}

    <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:${MUTED};margin:6px 0 0;text-align:center;">
      Or paste this into your browser:<br>
      <a href="${opts.ctaUrl}" style="color:${GOLD};word-break:break-all;">${opts.ctaUrl}</a>
    </p>

    ${blessing()}

    <p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:${MUTED};margin:26px 0 0;">
      With warmth,<br>
      <span style="color:${GOLD};font-size:16px;">The Sundaragiri Family</span><br>
      <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};">Founding family, Pravara</span>
    </p>`;

  const text = [
    `Namaste ${name},`,
    ``,
    `Your seat in the founding circle is reserved.`,
    opts.seatNumber ? `Yours is the ${ordinal(opts.seatNumber)} of ${COHORT_TARGET.toLocaleString()} seats.` : ``,
    ``,
    `Our grandparents did this with a notebook and a network of people who knew the family.`,
    `That network thinned as we scattered. Pravara is our attempt to rebuild it — the same`,
    `questions about gotra, lineage and character, asked with the same care.`,
    ``,
    `What would help most now is your profile. Not a form — a conversation with Narada, our AI,`,
    `which asks the things an elder would ask and writes it up for you. About three minutes.`,
    ``,
    `Founders who finish are matched before anyone else when we open, and keep`,
    `${FOUNDER_PREMIUM_MONTHS} months of premium, free.`,
    ``,
    `Build your profile: ${opts.ctaUrl}`,
    ``,
    `|| shubham astu ||  — may it be auspicious`,
    ``,
    `With warmth,`,
    `The Sundaragiri Family`,
    `Founding family, Pravara`,
  ]
    // Drop the seat line when we do not know the number, rather than
    // leaving a blank line where a fact should be.
    .filter((line, i) => !(i === 3 && line === ""))
    .join("\n");

  return {
    subject: `${name}, your founding seat is reserved`,
    html: shell({
      // Shown next to the subject in most inboxes — the second thing read, so
      // it carries the specific detail rather than repeating the subject.
      preheader: opts.seatNumber
        ? `The ${ordinal(opts.seatNumber)} of ${COHORT_TARGET.toLocaleString()} seats. Build your profile to be matched first.`
        : `Build your profile to be matched first when we open.`,
      body,
      contactEmail: opts.contactEmail,
    }),
    text,
  };
}

/** Reminder for founders who registered but never finished a profile. */
export function profileReminderEmail(opts: { firstName: string; ctaUrl: string; contactEmail: string }) {
  const name = opts.firstName?.trim() || "friend";
  const body = `
    <p style="font-family:Georgia,serif;font-size:17px;color:${MUTED};margin:0 0 6px;font-style:italic;">Namaste ${name},</p>

    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:29px;line-height:1.3;color:${INK};margin:14px 0 0;font-weight:400;">
      Your seat is held. Your profile is not yet written.
    </h1>

    <div style="height:1px;width:48px;background:${GOLD};opacity:.6;margin:22px 0;"></div>

    <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:${MUTED};margin:0 0 18px;">
      When matching opens, we start with the founders we can actually introduce — the ones whose
      gotra, community and intentions are on the page. Yours is still blank.
    </p>

    <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:${MUTED};margin:0;">
      It is a short conversation, not a form. Finishing it keeps your
      <strong style="color:${GOLD};">${FOUNDER_PREMIUM_MONTHS} months of premium, free</strong>.
    </p>

    ${button(opts.ctaUrl, "FINISH MY PROFILE")}

    <p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:${MUTED};margin:26px 0 0;">
      With warmth,<br>
      <span style="color:${GOLD};font-size:16px;">The Sundaragiri Family</span>
    </p>`;

  const text = [
    `Namaste ${name},`,
    ``,
    `Your seat is held. Your profile is not yet written.`,
    ``,
    `When matching opens, we start with the founders we can actually introduce — the ones whose`,
    `gotra, community and intentions are on the page. Yours is still blank.`,
    ``,
    `It is a short conversation, not a form. Finishing it keeps your ${FOUNDER_PREMIUM_MONTHS} months of premium, free.`,
    ``,
    `Finish your profile: ${opts.ctaUrl}`,
    ``,
    `With warmth,`,
    `The Sundaragiri Family`,
  ].join("\n");

  return {
    subject: `${name}, your founding profile is still unwritten`,
    html: shell({
      preheader: "Founders with a finished profile are introduced first.",
      body,
      contactEmail: opts.contactEmail,
    }),
    text,
  };
}
