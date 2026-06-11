// Profile strength — how complete/matchable a founding profile is. Used by the
// Founding Dashboard to gamify depth ("good profile strength") and decide who is
// launch-ready. Pure + server-safe (no client deps), so it can run anywhere.

export type StrengthField = {
  key: string;
  label: string;
  weight: number;
  /** Optional custom presence check (defaults to "truthy, non-empty, non-'No Preference'"). */
  present?: (profile: Record<string, unknown>) => boolean;
};

function isPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    const v = value.trim();
    return v.length > 0 && v.toLowerCase() !== "no preference";
  }
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  return Boolean(value);
}

// Weighted toward the signals that actually drive Vedic matrimony matches.
export const STRENGTH_FIELDS: StrengthField[] = [
  { key: "full_name", label: "Name", weight: 4 },
  { key: "age", label: "Age", weight: 4 },
  { key: "gender", label: "Gender", weight: 4 },
  { key: "location", label: "Location", weight: 7 },
  { key: "profession", label: "Profession", weight: 7 },
  { key: "education", label: "Education", weight: 7 },
  { key: "height", label: "Height", weight: 4 },
  { key: "diet", label: "Diet", weight: 4 },
  { key: "marital_status", label: "Marital status", weight: 4 },
  { key: "image_url", label: "A photo", weight: 13 },
  { key: "gothra", label: "Gothra", weight: 9 },
  { key: "nakshatra", label: "Nakshatra", weight: 9 },
  { key: "raasi", label: "Raasi", weight: 6 },
  { key: "sub_community", label: "Community", weight: 8 },
  { key: "bio", label: "A short bio", weight: 6 },
  {
    key: "partner_preferences",
    label: "Partner preferences",
    weight: 6,
    present: (p) =>
      isPresent(p.partner_min_age) ||
      isPresent(p.partner_diet) ||
      isPresent(p.partner_location_pref) ||
      isPresent(p.partner_marital_status),
  },
];

const TOTAL_WEIGHT = STRENGTH_FIELDS.reduce((sum, f) => sum + f.weight, 0);

/** Profiles at or above this score are considered "launch-ready". */
export const LAUNCH_READY_THRESHOLD = 75;

export type ProfileStrength = {
  score: number; // 0–100
  isLaunchReady: boolean;
  /** Highest-weight missing fields first — what to prompt the founder to add next. */
  missing: { key: string; label: string }[];
};

export function computeProfileStrength(
  profile: Record<string, unknown> | null | undefined,
): ProfileStrength {
  if (!profile) {
    return {
      score: 0,
      isLaunchReady: false,
      missing: STRENGTH_FIELDS.map(({ key, label }) => ({ key, label })),
    };
  }

  let earned = 0;
  const missing: { key: string; label: string }[] = [];

  for (const field of STRENGTH_FIELDS) {
    const present = field.present ? field.present(profile) : isPresent(profile[field.key]);
    if (present) {
      earned += field.weight;
    } else {
      missing.push({ key: field.key, label: field.label });
    }
  }

  // Surface the most valuable gaps first.
  missing.sort((a, b) => {
    const wa = STRENGTH_FIELDS.find((f) => f.key === a.key)?.weight ?? 0;
    const wb = STRENGTH_FIELDS.find((f) => f.key === b.key)?.weight ?? 0;
    return wb - wa;
  });

  const score = Math.round((earned / TOTAL_WEIGHT) * 100);
  return { score, isLaunchReady: score >= LAUNCH_READY_THRESHOLD, missing };
}
