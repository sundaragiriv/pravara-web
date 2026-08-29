import "server-only";

import { blessing, button, GOLD, INK, MUTED, shell } from "@/lib/email-templates";
import { FOUNDER_PREMIUM_MONTHS } from "@/lib/offer";

/**
 * The founding-circle sequence: three cohort milestones and two on the premium.
 *
 * Every number here is passed in from a live count rather than written into the
 * copy. These are the emails most likely to be caught being wrong — a member
 * who reads "100 seats left" and then sees a different figure on the register
 * page has learned something about how much to trust the rest of it. See
 * lib/email-sequence.ts, where the thresholds are derived from COHORT_TARGET
 * for the same reason.
 *
 * The voice stays where the rest of the site is: restrained and specific.
 * Scarcity is a fact being reported, not a technique — which is also why the
 * two "share this" emails open by saying that nothing is being asked of the
 * reader's own seat.
 *
 * Shell, button and blessing come from email-templates so there is one card,
 * one gold and one set of type rules across every message Pravara sends.
 */

type SequenceOptions = {
  firstName: string;
  ctaUrl: string;
  contactEmail: string;
};

/** These are signed by the family, not by "the Pravara team". */
function signOff(): string {
  return `
    <p style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:${MUTED};margin:26px 0 0;">
      With warmth,<br>
      <span style="color:${GOLD};font-size:16px;">The Sundaragiri Family</span><br>
      <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};">Founding family, Pravara</span>
    </p>`;
}

function para(text: string): string {
  return `<p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:${MUTED};margin:0 0 18px;">${text}</p>`;
}

function heading(text: string): string {
  return `<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:29px;line-height:1.3;color:${INK};margin:14px 0 0;font-weight:400;">${text}</h1>
    <div style="height:1px;width:48px;background:${GOLD};opacity:.6;margin:22px 0;"></div>`;
}

function greeting(name: string): string {
  return `<p style="font-family:Georgia,serif;font-size:17px;color:${MUTED};margin:0 0 6px;font-style:italic;">Namaste ${name},</p>`;
}

const firstNameOr = (name: string) => name?.trim() || "friend";

/** Milestone one: the circle is filling. Social proof, and a reason to share. */
export function cohortQuarterEmail(
  opts: SequenceOptions & { joined: number; target: number; phrase: string },
) {
  const name = firstNameOr(opts.firstName);
  const joined = opts.joined.toLocaleString();
  const target = opts.target.toLocaleString();

  const body = `
    ${greeting(name)}
    ${heading(`We are ${opts.phrase}.`)}
    ${para(`<strong style="color:${GOLD};">${joined}</strong> families have taken a seat in the founding circle of ${target}. You were one of the first.`)}
    ${para(`Every one of them arrived the way you did — someone thought Pravara was worth passing on. That is the only way this circle grows, and it is the reason the matching will be worth anything when it opens.`)}
    ${para(`If there is a family you would want in it, this is the moment to tell them.`)}
    ${button(opts.ctaUrl, "SHARE PRAVARA")}
    ${signOff()}`;

  const text = [
    `Namaste ${name},`,
    ``,
    `We are ${opts.phrase}.`,
    ``,
    `${joined} families have taken a seat in the founding circle of ${target}. You were one of the first.`,
    ``,
    `Every one of them arrived the way you did — someone thought Pravara was worth passing on.`,
    `That is the only way this circle grows, and it is the reason the matching will be worth`,
    `anything when it opens.`,
    ``,
    `If there is a family you would want in it, this is the moment to tell them:`,
    opts.ctaUrl,
    ``,
    `With warmth,`,
    `The Sundaragiri Family`,
    `Founding family, Pravara`,
  ].join("\n");

  return {
    subject: `We are ${opts.phrase} — ${joined} founding families`,
    html: shell({
      preheader: `${joined} of ${target} seats taken.`,
      body,
      contactEmail: opts.contactEmail,
    }),
    text,
  };
}

/** Milestone two: the real number of seats left, and what closes with them. */
export function cohortSeatsLeftEmail(
  opts: SequenceOptions & { joined: number; target: number; left: number },
) {
  const name = firstNameOr(opts.firstName);
  const joined = opts.joined.toLocaleString();
  const target = opts.target.toLocaleString();

  const body = `
    ${greeting(name)}
    ${heading(`${opts.left} seats left in the founding circle.`)}
    ${para(`${joined} of ${target} are taken. Yours is one of them and stays that way — this is not a note asking you for anything.`)}
    ${para(`It is a note in case there is someone you meant to tell and have not. When the circle closes the founding terms close with it: matched first when we open, and ${FOUNDER_PREMIUM_MONTHS} months of premium at no cost.`)}
    ${para(`After that Pravara opens normally, and the families who came in early stop being early.`)}
    ${button(opts.ctaUrl, "SHARE WHILE SEATS REMAIN")}
    ${signOff()}`;

  const text = [
    `Namaste ${name},`,
    ``,
    `${opts.left} seats left in the founding circle.`,
    ``,
    `${joined} of ${target} are taken. Yours is one of them and stays that way —`,
    `this is not a note asking you for anything.`,
    ``,
    `It is a note in case there is someone you meant to tell and have not. When the circle`,
    `closes the founding terms close with it: matched first when we open, and`,
    `${FOUNDER_PREMIUM_MONTHS} months of premium at no cost.`,
    ``,
    `Share while seats remain: ${opts.ctaUrl}`,
    ``,
    `With warmth,`,
    `The Sundaragiri Family`,
    `Founding family, Pravara`,
  ].join("\n");

  return {
    subject: `${opts.left} seats left in the founding circle`,
    html: shell({
      preheader: `${joined} of ${target} taken. The founding terms close with the circle.`,
      body,
      contactEmail: opts.contactEmail,
    }),
    text,
  };
}

/** Milestone three: the circle is closed and matching has a date. */
export function cohortFullEmail(opts: SequenceOptions & { target: number; days: number }) {
  const name = firstNameOr(opts.firstName);

  const body = `
    ${greeting(name)}
    ${heading(`Matching opens in ${opts.days} days.`)}
    ${para(`The founding circle is closed at ${opts.target.toLocaleString()}. What happens next depends on one thing, and it is the thing only you can do.`)}
    ${para(`We match on what is written down — gotra, community, what you are actually hoping for in a family. A profile left half-written is matched half as well, and no amount of care on our side makes up for a blank field.`)}
    ${para(`It is a conversation with Narada rather than a form. About three minutes, and it is what the next ${opts.days} days are for.`)}
    ${button(opts.ctaUrl, "COMPLETE MY PROFILE")}
    ${blessing()}
    ${signOff()}`;

  const text = [
    `Namaste ${name},`,
    ``,
    `Matching opens in ${opts.days} days.`,
    ``,
    `The founding circle is closed at ${opts.target.toLocaleString()}. What happens next depends on`,
    `one thing, and it is the thing only you can do.`,
    ``,
    `We match on what is written down — gotra, community, what you are actually hoping for in a`,
    `family. A profile left half-written is matched half as well.`,
    ``,
    `It is a conversation with Narada rather than a form. About three minutes.`,
    ``,
    `Complete your profile: ${opts.ctaUrl}`,
    ``,
    `|| shubham astu ||  — may it be auspicious`,
    ``,
    `With warmth,`,
    `The Sundaragiri Family`,
    `Founding family, Pravara`,
  ].join("\n");

  return {
    subject: `Matching opens in ${opts.days} days — complete your profile`,
    html: shell({
      preheader: `The circle is closed. Your profile is what the next ${opts.days} days are for.`,
      body,
      contactEmail: opts.contactEmail,
    }),
    text,
  };
}

/** Founding premium with time still on it. A reminder, deliberately not a pitch. */
export function premiumEndingEmail(opts: SequenceOptions & { days: number; tier: string }) {
  const name = firstNameOr(opts.firstName);

  const body = `
    ${greeting(name)}
    ${heading(`Your founding premium ends in ${opts.days} days.`)}
    ${para(`Nothing happens today and nothing needs doing. This is only so the date does not arrive as a surprise.`)}
    ${para(`Your ${FOUNDER_PREMIUM_MONTHS} months as a founding member run out in ${opts.days} days, and the account moves to Basic on its own unless you choose otherwise. Your profile, your matches and your conversations all stay exactly where they are.`)}
    ${para(`If you would rather keep ${opts.tier}, you can do that whenever you like — including after it lapses.`)}
    ${button(opts.ctaUrl, "SEE WHAT CHANGES")}
    ${signOff()}`;

  const text = [
    `Namaste ${name},`,
    ``,
    `Your founding premium ends in ${opts.days} days.`,
    ``,
    `Nothing happens today and nothing needs doing. This is only so the date does not arrive`,
    `as a surprise.`,
    ``,
    `Your ${FOUNDER_PREMIUM_MONTHS} months as a founding member run out in ${opts.days} days, and the account moves`,
    `to Basic on its own unless you choose otherwise. Your profile, your matches and your`,
    `conversations all stay exactly where they are.`,
    ``,
    `If you would rather keep ${opts.tier}, you can do that whenever you like — including`,
    `after it lapses.`,
    ``,
    `See what changes: ${opts.ctaUrl}`,
    ``,
    `With warmth,`,
    `The Sundaragiri Family`,
    `Founding family, Pravara`,
  ].join("\n");

  return {
    subject: `Your founding premium ends in ${opts.days} days`,
    html: shell({
      preheader: `Nothing to do today. The account moves to Basic on its own in ${opts.days} days.`,
      body,
      contactEmail: opts.contactEmail,
    }),
    text,
  };
}

/** The founding premium has lapsed. States plainly what changed and what did not. */
export function premiumEndedEmail(opts: SequenceOptions & { tier: string }) {
  const name = firstNameOr(opts.firstName);

  const body = `
    ${greeting(name)}
    ${heading(`Your ${FOUNDER_PREMIUM_MONTHS} months are up.`)}
    ${para(`Your account has moved to Basic. Nothing has been deleted — your profile, your shortlist, your conversations and every introduction you have already made are all still there.`)}
    ${para(`What ${opts.tier} keeps open is the part that finds people: seeing who has shortlisted you, sending an introduction first rather than waiting to be found, and the full Kundali reading on every match rather than the summary.`)}
    ${para(`If Basic is the right fit for now, that is genuinely fine. You stay in the circle either way, and you can come back to ${opts.tier} at any point.`)}
    ${button(opts.ctaUrl, `CONTINUE WITH ${opts.tier.toUpperCase()}`)}
    ${signOff()}`;

  const text = [
    `Namaste ${name},`,
    ``,
    `Your ${FOUNDER_PREMIUM_MONTHS} months are up.`,
    ``,
    `Your account has moved to Basic. Nothing has been deleted — your profile, your shortlist,`,
    `your conversations and every introduction you have already made are all still there.`,
    ``,
    `What ${opts.tier} keeps open is the part that finds people: seeing who has shortlisted you,`,
    `sending an introduction first rather than waiting to be found, and the full Kundali reading`,
    `on every match rather than the summary.`,
    ``,
    `If Basic is the right fit for now, that is genuinely fine. You stay in the circle either way.`,
    ``,
    `Continue with ${opts.tier}: ${opts.ctaUrl}`,
    ``,
    `With warmth,`,
    `The Sundaragiri Family`,
    `Founding family, Pravara`,
  ].join("\n");

  return {
    subject: `Your ${FOUNDER_PREMIUM_MONTHS} months are up — what ${opts.tier} keeps open`,
    html: shell({
      preheader: `Your account moved to Basic. Nothing was deleted.`,
      body,
      contactEmail: opts.contactEmail,
    }),
    text,
  };
}
