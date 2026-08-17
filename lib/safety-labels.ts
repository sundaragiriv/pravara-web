/**
 * Report reasons, and how they read to a member.
 *
 * Separate from `lib/safety.ts` because that module is server-only and this is
 * needed by the report dialog, which is a client component.
 *
 * The wording is first-person and plain — "This profile seems fake", not
 * "Fraudulent account". Someone filling this in may be upset, and the list
 * should read like the sentence they would say out loud.
 */

export const REPORT_REASONS = [
  "fake_profile",
  "harassment",
  "inappropriate_photos",
  "asking_for_money",
  "already_married",
  "underage",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  fake_profile: "This profile seems fake",
  harassment: "Harassment or abusive messages",
  inappropriate_photos: "Inappropriate photos",
  asking_for_money: "Asking for money",
  already_married: "Already married or in a relationship",
  underage: "This person appears to be under 18",
  other: "Something else",
};

/** Shorter labels for the admin queue, where the column is narrow. */
export const REPORT_REASON_SHORT: Record<ReportReason, string> = {
  fake_profile: "Fake profile",
  harassment: "Harassment",
  inappropriate_photos: "Photos",
  asking_for_money: "Money",
  already_married: "Already married",
  underage: "Underage",
  other: "Other",
};
