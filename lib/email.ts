import "server-only";

import { Resend } from "resend";
import type { LaunchRegistrationRequest, SupportRequest } from "@/lib/api-schemas";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;
const supportInbox = process.env.SUPPORT_EMAIL || "support@pravara.com";
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

function buildLaunchAckText(input: LaunchRegistrationRequest): string {
  return [
    `Hi ${input.full_name},`,
    "",
    "You are on the founding list for Pravara.",
    "",
    "We are opening the platform carefully so the first members arrive to a high-intent, high-trust experience.",
    "As a founding registrant, you will be considered for early access and launch benefits when we turn the lights on.",
    "",
    "What happens next:",
    "- We review registrations as the founding cohort fills",
    "- We email you when access opens for your cohort",
    "- Founding members may receive launch-only premium benefits",
    "",
    "Pravara",
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

  await resend.emails.send({
    from: emailFrom,
    to: input.email,
    replyTo: launchInbox,
    subject: "You are on the Pravara founding list",
    text: buildLaunchAckText(input),
  });
}
