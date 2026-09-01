import "server-only";

import { Resend } from "resend";
import type { LaunchRegistrationRequest, SupportRequest } from "@/lib/api-schemas";
import { getSiteUrl } from "@/lib/env";
import {
  founderWelcomeEmail,
  guardianInviteEmail,
  launchDigestEmail,
  profileReminderEmail,
  type DigestRegistration,
} from "@/lib/email-templates";
import { mailPreferenceFor, unsubscribeHeaders, unsubscribeUrl } from "@/lib/email-preferences";
import { CONTACT_EMAIL } from "@/lib/site";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

/**
 * One inbox for everything.
 *
 * There were two environment variables here, SUPPORT_EMAIL and LAUNCH_EMAIL,
 * chained so that launch fell back to support and support fell back to
 * CONTACT_EMAIL. Neither was ever set, so all three resolved to the same
 * address anyway — the indirection described a routing arrangement that did
 * not exist, and reading the code suggested support and launch mail went to
 * different places.
 *
 * While Pravara is small it is deliberately one address: care@pravara.ai, the
 * same one printed in every footer. If support and launch ever need to split,
 * this is the one line to change.
 */
const inbox = CONTACT_EMAIL;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export function isEmailConfigured(): boolean {
  return Boolean(resend && emailFrom);
}

/**
 * Addresses that cannot receive mail, and must never be attempted.
 *
 * RFC 2606 and RFC 6761 reserve .test, .example, .invalid and .localhost so
 * they can never resolve. Dev's seeded registrations use @lead.pravara.test,
 * and running the reminder cron against dev queued 78 messages to a domain
 * that does not exist. Every one is a hard bounce, and a bounce rate like that
 * is exactly what Gmail and Yahoo use to decide whether a domain's mail reaches
 * inboxes at all — including the password resets.
 *
 * Cheaper to refuse here than to remember not to run a job. The same guard
 * protects production from a typo'd or seeded address getting in.
 */
const UNDELIVERABLE_TLDS = ["test", "example", "invalid", "localhost"];

function isUndeliverable(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domain) return true;
  return UNDELIVERABLE_TLDS.some((tld) => domain === tld || domain.endsWith(`.${tld}`));
}

/**
 * Everything a non-transactional send needs: whether it may go at all, the
 * link for the footer, and the headers that put an Unsubscribe button in the
 * reader's mail client.
 *
 * Returns null when the address has opted out, and the caller must then send
 * nothing. It also returns null if the preference row cannot be read — failing
 * closed, because sending marketing to someone whose opt-out we could not check
 * is the error that costs a spam complaint, and a missed milestone email is
 * not.
 */
async function marketingContext(email: string) {
  if (isUndeliverable(email)) {
    console.warn("skipping undeliverable address:", email);
    return null;
  }

  const preference = await mailPreferenceFor(email);
  if (!preference || preference.unsubscribed) return null;
  return {
    url: unsubscribeUrl(preference.token),
    headers: unsubscribeHeaders(preference.token, inbox),
  };
}

function buildSupportInboxText(input: SupportRequest): string {
  return [
    "New support request submitted from Pravara.",
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Membership Tier: ${input.tier}`,
    `Subject: ${input.subject}`,
    "",
    "Message:",
    input.message,
  ].join("\n");
}

function buildSupportAckText(input: SupportRequest): string {
  return [
    `Hi ${input.name},`,
    "",
    "We received your support request and will review it as soon as possible.",
    "",
    `Subject: ${input.subject}`,
    "",
    "Summary of your message:",
    input.message,
    "",
    "If you need to add more context, reply to this email.",
    "",
    "Pravara Support",
  ].join("\n");
}

export async function sendSupportRequestEmails(input: SupportRequest) {
  if (!resend || !emailFrom) {
    throw new Error("Email service is not configured");
  }

  await resend.emails.send({
    from: emailFrom,
    to: inbox,
    replyTo: input.email,
    subject: `[Pravara Support] ${input.subject}`,
    text: buildSupportInboxText(input),
  });

  await resend.emails.send({
    from: emailFrom,
    to: input.email,
    replyTo: inbox,
    subject: "We received your Pravara support request",
    text: buildSupportAckText(input),
  });
}

/** The full name, assembled the one way everything else assembles it. */
function fullName(input: LaunchRegistrationRequest): string {
  return `${input.first_name} ${input.last_name}`.trim();
}

export async function sendLaunchRegistrationEmails(
  input: LaunchRegistrationRequest,
  /** Position in the founding circle. Left out rather than guessed if unknown. */
  seatNumber?: number,
): Promise<boolean> {
  if (!resend || !emailFrom) {
    throw new Error("Email service is not configured");
  }

  // A notification used to fire here, once per registration. Fine at three a
  // week; two hundred separate emails on the evening a flyer goes into WhatsApp
  // groups — doubling the send volume and burying the one inbox that has to
  // stay readable. sendLaunchDigest reports the same registrations once a day,
  // and /admin/registrants is the live view.

  // Given to us directly now, rather than guessed by splitting a full name on
  // the first space — which greeted "Sri Venkata Raja" as "Sri".
  const firstName = input.first_name;

  const ctaUrl =
    `${getSiteUrl()}/signup?email=${encodeURIComponent(input.email)}` +
    `&name=${encodeURIComponent(fullName(input))}`;
  // To the member, so it respects their preference. Someone who opted out and later
  // registers again has still asked not to be emailed.
  const marketing = await marketingContext(input.email);
  if (!marketing) return false;

  const welcome = founderWelcomeEmail({
    firstName,
    ctaUrl,
    contactEmail: inbox,
    seatNumber,
    unsubscribeUrl: marketing.url,
  });

  await resend.emails.send({
    from: emailFrom,
    to: input.email,
    replyTo: inbox,
    subject: welcome.subject,
    html: welcome.html,
    text: welcome.text,
    headers: marketing.headers,
  });

  return true;
}

/**
 * Reminder to a registered founder who hasn't finished their profile.
 *
 * Returns whether anything was actually sent. It used to return void, so a
 * caller could not tell a delivered reminder from one skipped for an opt-out —
 * and the cron, seeing no error, counted the skip as a send and burned one of
 * that person's two reminder slots. Someone who unsubscribed and later changed
 * their mind would then never receive the reminder they were owed.
 */
export async function sendProfileReminderEmail(input: {
  email: string;
  full_name: string;
  /** Absent on rows registered before the name was split in two. */
  first_name?: string | null;
}): Promise<boolean> {
  if (!resend || !emailFrom) return false;
  // Prefer the real first name. Splitting on the first space is the old guess,
  // kept only for rows that predate the split — it greets "Sri Venkata Raja"
  // as "Sri", which is exactly why the form asks for the two separately now.
  const firstName = input.first_name?.trim() || input.full_name.split(" ")[0] || "";
  const ctaUrl =
    `${getSiteUrl()}/signup?email=${encodeURIComponent(input.email)}` +
    `&name=${encodeURIComponent(input.full_name)}`;
  const marketing = await marketingContext(input.email);
  if (!marketing) return false;

  const reminder = profileReminderEmail({
    firstName,
    ctaUrl,
    contactEmail: inbox,
    unsubscribeUrl: marketing.url,
  });

  await resend.emails.send({
    from: emailFrom,
    to: input.email,
    replyTo: inbox,
    subject: reminder.subject,
    html: reminder.html,
    text: reminder.text,
    headers: marketing.headers,
  });

  return true;
}

export async function sendGuardianInviteEmail(input: {
  email: string;
  inviterName: string;
  role: string;
}) {
  if (!resend || !emailFrom) return;

  const invite = guardianInviteEmail({
    inviterName: input.inviterName,
    role: input.role,
    ctaUrl: `${getSiteUrl()}/kutumba`,
    contactEmail: inbox,
  });

  await resend.emails.send({
    from: emailFrom,
    to: input.email,
    replyTo: inbox,
    subject: invite.subject,
    html: invite.html,
    text: invite.text,
  });
}

/* ---------------------------------------------------------------------------
 * The founding-circle sequence.
 *
 * One sender for all five, because they differ only in which template rendered
 * them. The cron decides who gets what and records it; this just puts a
 * rendered message on the wire.
 * ------------------------------------------------------------------------- */

export type RenderedEmail = { subject: string; html: string; text: string };

/**
 * Sends one already-rendered sequence email.
 *
 * Throws rather than returning false on a Resend failure, so the caller can
 * roll back the ledger row it wrote before sending — a member who did not get
 * the email must stay eligible for it.
 */
export async function sendSequenceEmail(
  to: string,
  email: RenderedEmail,
  /** From sequenceMarketingContext, so the caller can render the link into the body. */
  headers?: Record<string, string>,
): Promise<void> {
  if (!resend || !emailFrom) {
    throw new Error("Email service is not configured");
  }

  await resend.emails.send({
    from: emailFrom,
    to,
    replyTo: inbox,
    subject: email.subject,
    html: email.html,
    text: email.text,
    headers,
  });
}

/**
 * Whether this address may receive sequence mail, and what to put in it.
 *
 * Exposed for the cron, which needs the unsubscribe URL when it renders the
 * template and the headers when it sends — and needs to know to skip the
 * address entirely before it claims a slot in the send ledger.
 */
export async function sequenceMarketingContext(email: string) {
  return marketingContext(email);
}

/**
 * The internal daily digest of new registrations.
 *
 * Internal mail: it goes to one inbox we control, carries no unsubscribe, and
 * is not gated on preferences.
 */
export async function sendLaunchDigest(input: {
  registrations: DigestRegistration[];
  byMarket: { label: string; count: number }[];
  hours: number;
  totalSoFar: number;
  target: number;
}): Promise<boolean> {
  if (!resend || !emailFrom) return false;

  const digest = launchDigestEmail(input);
  await resend.emails.send({
    from: emailFrom,
    to: inbox,
    subject: digest.subject,
    html: digest.html,
    text: digest.text,
  });
  return true;
}

/** The address a sequence recipient should reply to. Exposed for the cron. */
export function sequenceContactEmail(): string {
  return inbox;
}
