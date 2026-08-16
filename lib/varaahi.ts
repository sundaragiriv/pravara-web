/**
 * The Varaahi Shield.
 *
 * The FAQ promises members "community vouches from people who know you
 * personally, guardian mode where trusted family members participate, and
 * profile integrity signals", and says "a high Varaahi score means a deeply
 * trusted profile". None of that existed — vouches were collected and never
 * shown, and no score was ever computed. This is that promise, built.
 *
 * Four signals, each earned separately and shown as its own badge. Deliberately
 * NOT combined into one number.
 *
 * A single score invites the question "why is theirs higher than mine", which
 * is the ranking problem the community research spent six regions warning
 * against, wearing different clothes. Four plain statements of fact — identity
 * checked, three people vouched, a parent is on the profile, the profile is
 * complete — tell a family everything a number would, and tell it in terms they
 * can act on. A member who has three of four can see exactly what the fourth
 * needs.
 */

export type VaraahiSignal = {
  key: "identity" | "vouches" | "family" | "completeness";
  label: string;
  /** Whether the signal is earned. */
  earned: boolean;
  /** What the member sees when they ask why. */
  detail: string;
};

export type VaraahiProfileInput = {
  varaahi_status?: string | null;
  is_verified?: boolean | null;
  image_url?: string | null;
  gothra?: string | null;
  nakshatra?: string | null;
  bio?: string | null;
  profession?: string | null;
  education?: string | null;
  location?: string | null;
  dob?: string | null;
};

/**
 * The fields a profile needs before it is worth showing to another family.
 * Photo, lineage and a written biography are the ones people actually read;
 * the rest are the minimum for the compatibility engine to say anything.
 */
const COMPLETENESS_FIELDS: Array<{ key: keyof VaraahiProfileInput; label: string }> = [
  { key: "image_url", label: "a photo" },
  { key: "bio", label: "a biography" },
  { key: "gothra", label: "Gothra" },
  { key: "nakshatra", label: "Nakshatra" },
  { key: "profession", label: "profession" },
  { key: "education", label: "education" },
  { key: "location", label: "location" },
  { key: "dob", label: "date of birth" },
];

export function missingForCompleteness(profile: VaraahiProfileInput): string[] {
  return COMPLETENESS_FIELDS.filter(({ key }) => {
    const value = profile[key];
    return value === null || value === undefined || String(value).trim() === "";
  }).map(({ label }) => label);
}

export type VaraahiInput = {
  profile: VaraahiProfileInput;
  /** Endorsements recorded against this profile. */
  vouchCount: number;
  /** Collaborators who have accepted, i.e. family actually participating. */
  acceptedCollaborators: number;
};

/** At least this many vouches before the signal counts. */
export const VOUCHES_REQUIRED = 2;

export function computeVaraahi({
  profile,
  vouchCount,
  acceptedCollaborators,
}: VaraahiInput): VaraahiSignal[] {
  const missing = missingForCompleteness(profile);

  return [
    {
      key: "identity",
      label: "Identity checked",
      // is_verified is the admin's decision. varaahi_status alone is not
      // enough — it only records that a document was uploaded, and treating
      // that as verification is what made the old flow dishonest.
      earned: profile.is_verified === true,
      detail:
        profile.is_verified === true
          ? "A government ID has been checked by our team."
          : profile.varaahi_status === "pending_verification"
            ? "An ID has been submitted and is waiting to be checked."
            : "No government ID has been checked yet.",
    },
    {
      key: "vouches",
      label: vouchCount === 1 ? "1 vouch" : `${vouchCount} vouches`,
      earned: vouchCount >= VOUCHES_REQUIRED,
      detail:
        vouchCount >= VOUCHES_REQUIRED
          ? `${vouchCount} people who know this family personally have vouched for them.`
          : `Vouches from ${VOUCHES_REQUIRED} people who know the family are needed. ${vouchCount} so far.`,
    },
    {
      key: "family",
      label: "Family involved",
      earned: acceptedCollaborators > 0,
      detail:
        acceptedCollaborators > 0
          ? "A parent or sibling is taking part in this profile."
          : "No family member has joined this profile yet.",
    },
    {
      key: "completeness",
      label: "Profile complete",
      earned: missing.length === 0,
      detail:
        missing.length === 0
          ? "Everything a family would want to see has been filled in."
          : `Still to add: ${missing.join(", ")}.`,
    },
  ];
}

/** "3 of 4" — for a compact summary, never as a rank. */
export function earnedCount(signals: VaraahiSignal[]): number {
  return signals.filter((s) => s.earned).length;
}
