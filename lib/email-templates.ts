import "server-only";

// Email-safe HTML (tables + inline styles, ~600px, web-safe fonts). Warm ivory +
// gold to match the Vedic-matrimony brand and keep deliverability high.
const GOLD = "#b8860b";
const INK = "#1c1917";
const MUTED = "#57534e";
const CREAM = "#faf7f2";

function shell(opts: { preheader: string; body: string; contactEmail: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Pravara</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};">
<span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${opts.preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #efe7d8;border-radius:16px;overflow:hidden;">
      <tr><td align="center" style="padding:36px 40px 8px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;letter-spacing:6px;color:${GOLD};font-weight:700;">PRAVARA</div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;color:${MUTED};text-transform:uppercase;margin-top:6px;">Vedic Matrimony, by invitation</div>
        <div style="height:1px;width:64px;background:${GOLD};opacity:.5;margin:20px auto 0;"></div>
      </td></tr>
      <tr><td style="padding:16px 40px 40px;font-family:Arial,Helvetica,sans-serif;color:${INK};">
        ${opts.body}
      </td></tr>
      <tr><td style="padding:20px 40px;background:${CREAM};border-top:1px solid #efe7d8;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED};text-align:center;line-height:1.6;">
        You're receiving this because you joined the Pravara founding circle.<br>
        Questions? <a href="mailto:${opts.contactEmail}" style="color:${GOLD};text-decoration:none;">${opts.contactEmail}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
    <tr><td align="center" bgcolor="${GOLD}" style="border-radius:999px;">
      <a href="${href}" style="display:inline-block;padding:15px 34px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;letter-spacing:1px;color:#1c1917;text-decoration:none;border-radius:999px;">${label} &rarr;</a>
    </td></tr></table>`;
}

/** Sent right after a founder reserves their seat — drives them to build a profile. */
export function founderWelcomeEmail(opts: { firstName: string; ctaUrl: string; contactEmail: string }) {
  const name = opts.firstName?.trim() || "there";
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:26px;line-height:1.25;color:${INK};margin:8px 0 0;">Welcome to the Founder Circle, ${name}.</h1>
    <p style="font-size:15px;line-height:1.7;color:${MUTED};margin:16px 0;">Your founding seat is reserved. Now make it count — <strong style="color:${INK};">build your founding profile</strong> so you're matched with the right people the moment we open.</p>
    <p style="font-size:15px;line-height:1.7;color:${MUTED};margin:16px 0;">Founders with a complete profile get <strong style="color:${GOLD};">first access</strong> and <strong style="color:${GOLD};">3 months of premium, free</strong>. It takes about three minutes — guided by Narada, our AI.</p>
    ${button(opts.ctaUrl, "Build my founding profile")}
    <p style="font-size:13px;line-height:1.7;color:${MUTED};margin:8px 0 0;text-align:center;">Or paste this link in your browser:<br><a href="${opts.ctaUrl}" style="color:${GOLD};word-break:break-all;">${opts.ctaUrl}</a></p>`;
  const text = [
    `Welcome to the Pravara Founder Circle, ${name}.`,
    ``,
    `Your founding seat is reserved. Now make it count — build your founding profile so you're matched with the right people the moment we open.`,
    ``,
    `Founders with a complete profile get first access and 3 months of premium, free. It takes about three minutes, guided by Narada (our AI).`,
    ``,
    `Build your profile: ${opts.ctaUrl}`,
    ``,
    `Pravara — Vedic matrimony, by invitation`,
  ].join("\n");
  return {
    subject: "Welcome to the Founder Circle — finish your profile",
    html: shell({ preheader: "Your founding seat is reserved. Build your profile to be matched first.", body, contactEmail: opts.contactEmail }),
    text,
  };
}

/** Reminder for founders who registered but haven't completed their profile. */
export function profileReminderEmail(opts: { firstName: string; ctaUrl: string; contactEmail: string }) {
  const name = opts.firstName?.trim() || "there";
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:26px;line-height:1.25;color:${INK};margin:8px 0 0;">You're almost in, ${name}.</h1>
    <p style="font-size:15px;line-height:1.7;color:${MUTED};margin:16px 0;">Your founding seat is held — but your profile isn't finished yet. Founders with complete profiles are <strong style="color:${INK};">matched first</strong> when we open, and yours is only a few minutes away.</p>
    <p style="font-size:15px;line-height:1.7;color:${MUTED};margin:16px 0;">Finish it now and lock in your <strong style="color:${GOLD};">3 months of premium, free</strong>.</p>
    ${button(opts.ctaUrl, "Finish my profile")}`;
  const text = [
    `You're almost in, ${name}.`,
    ``,
    `Your founding seat is held, but your profile isn't finished. Founders with complete profiles are matched first when we open — and yours is a few minutes away.`,
    ``,
    `Finish it now and lock in your 3 months of premium, free: ${opts.ctaUrl}`,
    ``,
    `Pravara — Vedic matrimony, by invitation`,
  ].join("\n");
  return {
    subject: "Finish your founding profile — you're matched first",
    html: shell({ preheader: "Founders with complete profiles are matched first. Finish yours.", body, contactEmail: opts.contactEmail }),
    text,
  };
}
