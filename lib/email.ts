import "server-only";

import { Resend } from "resend";
import type { LaunchRegistrationRequest, SupportRequest } from "@/lib/api-schemas";
import { getSiteUrl } from "@/lib/env";
import { founderWelcomeEmail, profileReminderEmail } from "@/lib/email-templates";
import { CONTACT_EMAIL } from "@/lib/site";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;
const supportInbox = process.env.SUPPORT_EMAIL || CONTACT_EMAIL;
const launchInbox = process.env.LAUNCH_EMAIL || supportInbox;

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
    to: supportInbox,
    replyTo: input.email,
    subject: `[Pravara Support] ${input.subject}`,
    text: buildSupportInboxText(input),
  });

  await resend.emails.send({
    from: emailFrom,
    to: input.email,
    replyTo: supportInbox,
    subject: "We received your Pravara support request",
    text: buildSupportAckText(input),
  });
}

function buildLaunchInboxText(input: LaunchRegistrationRequest): string {
  return [
    "New founding-member registration submitted from Pravara.",
    "",
    `Name: ${input.full_name}`,
    `Age: ${input.age}`,
    `Gender: ${input.gender}`,
    `Profession: ${input.profession}`,
    `Location: ${input.location}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Source: ${input.source || "launch-homepage"}`,
  ].join("\n");
}

export async function sendLaunchRegistrationEmails(input: LaunchRegistrationRequest) {
  if (!resend || !emailFrom) {
    throw new Error("Email service is not configured");
  }

  await resend.emails.send({
    from: emailFrom,
    to: launchInbox,
    replyTo: input.email,
    subject: `[Pravara Launch] ${input.full_name} joined the founding list`,
    text: buildLaunchInboxText(input),
  });

  const firstName = input.full_name.split(" ")[0] || "";
  const ctaUrl =
    `${getSiteUrl()}/signup?email=${encodeURIComponent(input.email)}` +
    `&name=${encodeURIComponent(input.full_name)}`;
  const welcome = founderWelcomeEmail({ firstName, ctaUrl, contactEmail: supportInbox });

  await resend.emails.send({
    from: emailFrom,
    to: input.email,
    replyTo: launchInbox,
    subject: welcome.subject,
    html: welcome.html,
    text: welcome.text,
  });
}

/** Reminder to a registered founder who hasn't finished their profile. */
export async function sendProfileReminderEmail(input: { email: string; full_name: string }) {
  if (!resend || !emailFrom) return;
  const firstName = input.full_name.split(" ")[0] || "";
  const ctaUrl =
    `${getSiteUrl()}/signup?email=${encodeURIComponent(input.email)}` +
    `&name=${encodeURIComponent(input.full_name)}`;
  const reminder = profileReminderEmail({ firstName, ctaUrl, contactEmail: supportInbox });

  await resend.emails.send({
    from: emailFrom,
    to: input.email,
    replyTo: launchInbox,
    subject: reminder.subject,
    html: reminder.html,
    text: reminder.text,
  });
}
