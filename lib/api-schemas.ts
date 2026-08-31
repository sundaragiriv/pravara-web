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

/**
 * Prior turns, so follow-ups work. The route previously sent only the system
 * prompt and the latest message, which made every turn amnesiac — "what about
 * the other one?" could not resolve because there was no other one in scope.
 * Capped at 20 to bound both the prompt cost and the blast radius of a client
 * sending junk.
 */
const sutradharTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4_000),
});

export const sutradharRequestSchema = z.object({
  message: z.string().trim().min(1).max(2_000),
  contextPath: z.string().trim().max(256).default("/"),
  history: z.array(sutradharTurnSchema).max(20).default([]),
});

/**
 * Confirming a proposed profile edit. The assistant never writes directly; it
 * proposes, the member confirms, and this is what the confirmation carries.
 *
 * The server re-derives what is permitted from its own allow-list rather than
 * trusting anything here — this schema only bounds the shape.
 */
export const sutradharConfirmSchema = z.object({
  field: z.string().trim().min(1).max(40),
  value: z.string().trim().min(1).max(2_000),
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

/**
 * Age bounds, expressed as dates.
 *
 * The form asks for a date of birth rather than an age, so the 18-80 rule has
 * to be enforced against a calendar. Both bounds matter: under 18 is a legal
 * line a matrimonial site must not cross, and a birth year of 1890 is a typo
 * rather than a founder.
 */
const MIN_AGE = 18;
const MAX_AGE = 80;

function ageOn(dob: Date, now = new Date()): number {
  let age = now.getFullYear() - dob.getFullYear();
  const monthDelta = now.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

/** Exported so the route stores the same number the form was validated against. */
export function ageFromDob(dob: string): number {
  return ageOn(new Date(`${dob}T00:00:00Z`));
}

export const launchRegistrationSchema = z.object({
  // Split from a single full_name. A matrimonial introduction is made by name,
  // and "Sri Venkata Raja Sundaragiri" cannot be addressed correctly by
  // guessing which word to greet someone with.
  first_name: z.string().trim().min(1).max(60),
  last_name: z.string().trim().min(1).max(60),
  // ISO date from the form's date input. Age is derived, never sent.
  dob: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be YYYY-MM-DD")
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), "Not a real date")
    .refine((value) => ageFromDob(value) >= MIN_AGE, `You must be at least ${MIN_AGE}`)
    .refine((value) => ageFromDob(value) <= MAX_AGE, "Please check the year of birth"),
  gender: z.enum(["Male", "Female", "Other"]),
  // Onboarding-stage fields — optional at pre-registration to keep friction low.
  profession: z.string().trim().max(120).optional(),
  location: z.string().trim().max(160).optional(),
  email: z.email().trim().max(160),
  // E.164, assembled client-side from the country dial code + national number.
  phone: z.string().trim().min(7).max(24),
  // ISO 3166-1 alpha-2. Optional so a stale client cannot start failing, but the
  // form always sends it.
  country: z.string().trim().length(2).regex(/^[A-Z]{2}$/).optional(),
  // Subdivision code for a served market, free text elsewhere. Cross-checked
  // against the country in the route, where both values are known together.
  state: z.string().trim().max(60).optional(),
  city: z.string().trim().max(80).optional(),
  source: z.string().trim().max(64).optional(),
});

export const collaboratorInviteSchema = z.object({
  email: z.email().trim().max(160),
  role: z.enum(["Parent", "Sibling", "Relative", "Friend"]),
});

export const blockRequestSchema = z.object({
  profile_id: z.uuid(),
});

export const reportRequestSchema = z.object({
  profile_id: z.uuid(),
  reason: z.enum([
    "fake_profile",
    "harassment",
    "inappropriate_photos",
    "asking_for_money",
    "already_married",
    "underage",
    "other",
  ]),
  detail: z.string().trim().max(2_000).optional(),
  /** Reporting blocks by default; the member can untick it. */
  alsoBlock: z.boolean().default(true),
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
