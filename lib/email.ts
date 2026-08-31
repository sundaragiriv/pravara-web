import "server-only";

import { Resend } from "resend";
import type { LaunchRegistrationRequest, SupportRequest } from "@/lib/api-schemas";
import { getSiteUrl } from "@/lib/env";
import { founderWelcomeEmail, guardianInviteEmail, profileReminderEmail } from "@/lib/email-templates";
import { ageFromDob } from "@/lib/api-schemas";
import { regionName } from "@/lib/regions";
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

function buildLaunchInboxText(input: LaunchRegistrationRequest): string {
  // Spelled out, because the state arrives as a code and "NJ" in an inbox is a
  // lookup rather than a fact.
  const where = [
    input.city,
    input.state && input.country ? regionName(input.country, input.state) : input.state,
    input.country,
  ]
    .filter(Boolean)
    .join(", ");

  return [
    "New founding-member registration submitted from Pravara.",
    "",
    `Name: ${fullName(input)}`,
    `Date of birth: ${input.dob} (age ${ageFromDob(input.dob)})`,
    `Gender: ${input.gender}`,
    `Profession: ${input.profession}`,
    `Location: ${where || input.location || "—"}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Source: ${input.source || "launch-homepage"}`,
  ].join("\n");
}

export async function sendLaunchRegistrationEmails(
  input: LaunchRegistrationRequest,
  /** Position in the founding circle. Left out rather than guessed if unknown. */
  seatNumber?: number,
) {
  if (!resend || !emailFrom) {
    throw new Error("Email service is not configured");
  }

  await resend.emails.send({
    from: emailFrom,
    to: inbox,
    replyTo: input.email,
    subject: `[Pravara Launch] ${fullName(input)} joined the founding list`,
    text: buildLaunchInboxText(input),
  });

  // Given to us directly now, rather than guessed by splitting a full name on
  // the first space — which greeted "Sri Venkata Raja" as "Sri".
  const firstName = input.first_name;
  const ctaUrl =
    `${getSiteUrl()}/signup?email=${encodeURIComponent(input.email)}` +
    `&name=${encodeURIComponent(fullName(input))}`;
  const welcome = founderWelcomeEmail({
    firstName,
    ctaUrl,
    contactEmail: inbox,
    seatNumber,
  });

  await resend.emails.send({
    from: emailFrom,
    to: input.email,
    replyTo: inbox,
    subject: welcome.subject,
    html: welcome.html,
    text: welcome.text,
  });
}

/** Reminder to a registered founder who hasn't finished their profile. */
export async function sendProfileReminderEmail(input: {
  email: string;
  full_name: string;
  /** Absent on rows registered before the name was split in two. */
  first_name?: string | null;
}) {
  if (!resend || !emailFrom) return;
  // Prefer the real first name. Splitting on the first space is the old guess,
  // kept only for rows that predate the split — it greets "Sri Venkata Raja"
  // as "Sri", which is exactly why the form asks for the two separately now.
  const firstName = input.first_name?.trim() || input.full_name.split(" ")[0] || "";
  const ctaUrl =
    `${getSiteUrl()}/signup?email=${encodeURIComponent(input.email)}` +
    `&name=${encodeURIComponent(input.full_name)}`;
  const reminder = profileReminderEmail({ firstName, ctaUrl, contactEmail: inbox });

  await resend.emails.send({
    from: emailFrom,
    to: input.email,
    replyTo: inbox,
    subject: reminder.subject,
    html: reminder.html,
    text: reminder.text,
  });
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
export async function sendSequenceEmail(to: string, email: RenderedEmail): Promise<void> {
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
  });
}

/** The address a sequence recipient should reply to. Exposed for the cron. */
export function sequenceContactEmail(): string {
  return inbox;
}
