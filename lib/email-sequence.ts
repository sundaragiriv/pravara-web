import { COHORT_TARGET } from "@/lib/offer";

/**
 * The founding-circle email sequence.
 *
 * Every threshold and every number in the copy is derived from COHORT_TARGET
 * rather than written down twice. The sequence was specified as "250 → a
 * quarter of the way", "400 → 100 seats left", "500 → matching opens", which
 * only holds together if the circle is 500 — against the 1,000 the site
 * advertised at the time, 400 registrations left 600 seats, not 100. The
 * circle is 500 now, so those thresholds land at 125, 400 and 500.
 *
 * Deriving them means the claim stays true whatever the target is set to. If
 * the circle is later raised to 1,000, the whole sequence moves with it rather
 * than quietly turning the scarcity email into a false one.
 */

export type MilestoneKey = "cohort-quarter" | "cohort-hundred-left" | "cohort-full";

/** Seats still open when the scarcity note goes out. */
const SEATS_LEFT_AT = 100;

export type Milestone = {
  key: MilestoneKey;
  /** Registration count at which this fires. */
  at: number;
};

/**
 * Ordered by threshold. Only the highest one a cohort has crossed is sent, so
 * a circle that fills faster than the cron runs does not deliver three emails
 * at once — see pendingMilestone.
 */
export const MILESTONES: Milestone[] = [
  { key: "cohort-quarter", at: Math.round(COHORT_TARGET * 0.25) },
  { key: "cohort-hundred-left", at: COHORT_TARGET - SEATS_LEFT_AT },
  { key: "cohort-full", at: COHORT_TARGET },
].sort((a, b) => a.at - b.at) as Milestone[];

/**
 * The highest milestone this count has reached, or null.
 *
 * Returning one rather than all of them is deliberate: if registrations jump
 * past two thresholds between runs, the later message is the true one and the
 * earlier is stale news.
 */
export function pendingMilestone(count: number): Milestone | null {
  let hit: Milestone | null = null;
  for (const m of MILESTONES) if (count >= m.at) hit = m;
  return hit;
}

/**
 * "a quarter of the way", "halfway", and so on — describing the real fraction
 * rather than trusting a phrase written when the target was a different number.
 * The subject line has to survive the target moving, which it already has once.
 */
export function fractionPhrase(count: number, target = COHORT_TARGET): string {
  const f = target > 0 ? count / target : 0;
  if (f >= 0.95) return "at the last seats";
  if (f >= 0.7) return "most of the way there";
  if (f >= 0.6) return "two thirds of the way there";
  if (f >= 0.45) return "halfway there";
  if (f >= 0.2) return "a quarter of the way there";
  return "underway";
}

/** Seats remaining, never negative — a full circle reads as 0, not as -3. */
export function seatsLeft(count: number, target = COHORT_TARGET): number {
  return Math.max(0, target - count);
}

/** Days between the founding premium ending and the warning that it will. */
export const PREMIUM_WARNING_DAYS = 15;

/**
 * Days between the circle closing and matching opening.
 *
 * The "matching opens in 7 days" email promises a date, so this is the one
 * number in the sequence that is a commitment rather than a measurement.
 * Changing it changes what was promised to anyone who already received it.
 */
export const MATCHING_OPENS_IN_DAYS = 7;
