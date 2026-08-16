/**
 * Which profile fields the assistant may touch, and how a proposed value is
 * checked before it is allowed anywhere near the database.
 *
 * Kept out of the route so the API and the confirm endpoint validate through
 * exactly the same function. The previous route validated in one place and wrote
 * in another, which is the shape of gap that lets a bad value through.
 *
 * The important distinction here is between free-text fields and CONSTRAINED
 * ones. `gothra` is the input to the exogamy check — the rule that decides
 * whether two families may be introduced at all. A language model writing a
 * free-text gotra string into that column is the single most dangerous thing in
 * the old design, because a misspelling does not fail loudly; it fails as a
 * silently wrong marriage decision months later. Constrained fields must resolve
 * to a canonical entry or they are refused outright.
 */

import { NAKSHATRAS } from "@/utils/vedic-data";
import { resolveCommunity, resolveGothra } from "@/utils/community-data";

export const EDITABLE_FIELDS = [
  "bio",
  "profession",
  "education",
  "location",
  "gothra",
  "nakshatra",
  "sub_community",
  "diet",
  "height",
  "weight",
  "employer",
  "visa_status",
] as const;

export type EditableField = (typeof EDITABLE_FIELDS)[number];

const EDITABLE = new Set<string>(EDITABLE_FIELDS);

/** Human labels, so the confirmation card does not show a column name. */
export const FIELD_LABELS: Record<EditableField, string> = {
  bio: "About you",
  profession: "Profession",
  education: "Education",
  location: "Location",
  gothra: "Gothra",
  nakshatra: "Nakshatra",
  sub_community: "Sub-community",
  diet: "Diet",
  height: "Height",
  weight: "Weight",
  employer: "Employer",
  visa_status: "Visa status",
};

export function isEditableField(field: string): field is EditableField {
  return EDITABLE.has(field);
}

export type FieldCheck =
  | { ok: true; value: string }
  | { ok: false; reason: string };

/** For naming which tradition a colliding community name came from. */
const LANGUAGE_LABEL: Record<number, string> = {
  1: "Telugu",
  2: "Tamil",
  3: "Kannada",
  4: "North Indian",
  5: "Marathi",
  6: "Sanskrit",
  7: "Other",
};

/**
 * Nakshatra resolved by exact name or exact alt-name — never fuzzily.
 *
 * The community research turned up why that matters generally: names one edit
 * apart can belong to entirely different communities, and a helpful "did you
 * mean" is how someone ends up recorded as something they are not.
 */
function resolveNakshatra(value: string): string | undefined {
  const q = value.toLowerCase().trim();
  const hit = NAKSHATRAS.find(
    (n) => n.name.toLowerCase() === q || n.altNames.some((a) => a.toLowerCase() === q),
  );
  return hit?.name;
}

/**
 * Checks a proposed value and returns the CANONICAL form to store.
 *
 * Constrained fields return the canonical spelling rather than what was typed,
 * so the database accumulates one spelling per concept instead of a dozen. The
 * matcher compares these strings directly; variant spellings there mean missed
 * or wrongly-permitted matches.
 */
export function checkFieldValue(field: EditableField, raw: string): FieldCheck {
  const value = raw.trim();

  if (!value) {
    return { ok: false, reason: "the value was empty" };
  }

  if (field === "gothra") {
    const result = resolveGothra(value);

    // An ambiguous spelling is the case worth handling well. Picking one would
    // be a coin flip on the field that decides which marriages are permitted,
    // so name both and let the member say which is theirs.
    if (result.status === "ambiguous") {
      const names = result.candidates.map((c) => c.name);
      return {
        ok: false,
        reason:
          `"${value}" could mean ${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}. ` +
          `These are different Gothras, so I will not choose for you — please tell me which one, ` +
          `or set it in your profile editor.`,
      };
    }

    if (result.status === "unknown") {
      return {
        ok: false,
        reason:
          `"${value}" is not a Gothra I recognise. Because Gothra decides which ` +
          `matches are permitted, I will not guess at it. Please set it in your ` +
          `profile editor, where you can pick from the list.`,
      };
    }

    return { ok: true, value: result.match.name };
  }

  if (field === "nakshatra") {
    const hit = resolveNakshatra(value);
    if (!hit) {
      return {
        ok: false,
        reason:
          `"${value}" is not one of the 27 Nakshatras as I know them. Your ` +
          `Nakshatra feeds the Bhrugu Match calculation, so I would rather you ` +
          `chose it in the profile editor than have me guess.`,
      };
    }
    return { ok: true, value: hit };
  }

  if (field === "sub_community") {
    // No languageId here — the assistant does not know which language tree the
    // member sits in. Ambiguity therefore surfaces rather than being guessed at,
    // and the profile editor (which does know) can resolve it cleanly.
    const result = resolveCommunity(value);

    if (result.status === "ambiguous") {
      const langs = result.candidates.map((c) => `${c.name} (${LANGUAGE_LABEL[c.languageId] ?? "another tradition"})`);
      return {
        ok: false,
        reason:
          `"${value}" exists in more than one tradition — ${langs.join(" and ")}. ` +
          `Please set it in your profile editor, where you can pick the right one.`,
      };
    }

    if (result.status === "unknown") {
      return {
        ok: false,
        reason:
          `I do not have "${value}" in the community list. Rather than record ` +
          `something that may be wrong, please set it in your profile editor — ` +
          `there is an option there for communities we do not yet list.`,
      };
    }

    return { ok: true, value: result.match.name };
  }

  // Free-text fields. Length is the only constraint; the caller sanitises.
  if (value.length > 2_000) {
    return { ok: false, reason: "that is longer than the field allows" };
  }

  return { ok: true, value };
}
