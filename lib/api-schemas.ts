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
  profession: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(160),
  email: z.email().trim().max(160),
  phone: z.string().trim().min(7).max(24),
  source: z.string().trim().max(64).optional(),
});

export type BiographerMessage = z.infer<typeof biographerMessageSchema>;
export type SupportRequest = z.infer<typeof supportRequestSchema>;
export type LaunchRegistrationRequest = z.infer<typeof launchRegistrationSchema>;

export function toOpenAIHistory(messages: BiographerMessage[]) {
  return messages.map((message) => ({
    role: message.role === "checkpoint" ? "assistant" : message.role,
    content: message.content,
  }));
}
