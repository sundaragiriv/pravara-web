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

export type BiographerMessage = z.infer<typeof biographerMessageSchema>;

export function toOpenAIHistory(messages: BiographerMessage[]) {
  return messages.map((message) => ({
    role: message.role === "checkpoint" ? "assistant" : message.role,
    content: message.content,
  }));
}
