import { z } from "zod";

const biographerMessageSchema = z.object({
  role: z.enum(["assistant", "user", "system", "checkpoint"]),
  content: z.string().trim().min(1).max(8_000),
});

const partnerProfileSchema = z
  .object({
    full_name: z.string().trim().max(120).optional(),
    location: z.string().trim().max(120).optional(),
    profession: z.string().trim().max(120).optional(),
    sub_community: z.string().trim().max(120).optional(),
  })
  .passthrough();

export const biographerRequestSchema = z.object({
  messages: z.array(biographerMessageSchema).min(1).max(40),
  currentProfile: z.record(z.string(), z.unknown()).default({}),
});

export const sutradharRequestSchema = z.object({
  message: z.string().trim().min(1).max(2_000),
  contextPath: z.string().trim().max(256).default("/"),
});

export const sutradharHintRequestSchema = z.object({
  partnerProfile: partnerProfileSchema.default({}),
});

export const supportRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().trim().max(160),
  subject: z.string().trim().min(1).max(120),
  message: z.string().trim().min(10).max(5_000),
  tier: z.enum(["Basic", "Gold", "Concierge"]),
});

export const launchRegistrationSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  age: z.coerce.number().int().min(18).max(80),
  gender: z.enum(["Male", "Female", "Other"]),
  // Onboarding-stage fields — optional at pre-registration to keep friction low.
  profession: z.string().trim().max(120).optional(),
  location: z.string().trim().max(160).optional(),
  email: z.email().trim().max(160),
  phone: z.string().trim().min(7).max(24),
  source: z.string().trim().max(64).optional(),
});

export const vouchRequestSchema = z.object({
  profile_id: z.uuid(),
  endorser_name: z.string().trim().min(2).max(80),
  relation: z.enum(["Friend", "Sibling", "Parent", "Relative", "Colleague", "Other"]),
  comment: z.string().trim().min(5).max(600),
});

export const launchAnalyticsEventSchema = z.object({
  event: z.enum([
    "launch_home_view",
    "launch_register_view",
    "launch_register_click",
    "launch_registration_completed",
  ]),
  path: z.string().trim().min(1).max(160),
  source: z.string().trim().max(80).optional(),
  session_id: z.string().trim().min(8).max(120).optional(),
});

export type BiographerMessage = z.infer<typeof biographerMessageSchema>;
export type SupportRequest = z.infer<typeof supportRequestSchema>;
export type LaunchRegistrationRequest = z.infer<typeof launchRegistrationSchema>;
export type LaunchAnalyticsEventRequest = z.infer<typeof launchAnalyticsEventSchema>;
export type VouchRequest = z.infer<typeof vouchRequestSchema>;

export function toOpenAIHistory(messages: BiographerMessage[]) {
  return messages.map((message) => ({
    role: message.role === "checkpoint" ? "assistant" : message.role,
    content: message.content,
  }));
}
