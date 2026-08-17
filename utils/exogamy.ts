/**
 * Gothra and Pravara exogamy — the rule Pravara exists to honour.
 *
 * Pulled out of matchEngine.ts because it had four defects that all shared one
 * cause: the check answered "are these two strings equal?" when the question is
 * "do these two families share a lineage?".
 *
 *   1. String comparison after only case/space normalisation. "Bharadwaja" and
 *      "Bhardwaj" are the same gothra and compared unequal, so two families of
 *      one lineage were told they were free to proceed. This is the failure the
 *      whole feature exists to prevent, and it fired on ordinary spelling.
 *
 *   2. Missing gothra returned false — indistinguishable from "checked and
 *      clear". A profile that had never supplied a gothra was reported as
 *      passing the exogamy check.
 *
 *   3. Pravara was not consulted at all, though the FAQ tells members it is.
 *      Bharadwaja's pravara sits entirely inside Gargya's; traditional practice
 *      prohibits that union and the platform was recommending it.
 *
 *   4. Pravara lookups were keyed on names that do not match the canonical
 *      gothra list ("harithasa" vs "Harita"), so even the known data was
 *      unreachable for several entries.
 *
 * The design principle throughout: this check may say blocked, and it may say
 * clear, but when it cannot tell it must say so out loud. Silence read as
 * consent is what made the old version dangerous.
 */

import { VEDIC_DATA } from "@/lib/vedicData";
import { GOTHRAS, resolveGothra, type Gothra } from "@/utils/community-data";

export type ExogamyInput = {
  gothra?: string | null;
  gothra_id?: number | null;
  /** The member's own pravara line, when they have given one. */
  pravara?: string | null;
};

export type ExogamyVerdict =
  /** A shared lineage was found. The match must not proceed. */
  | { status: "blocked"; rule: "sagothra" | "sapravara"; message: string; detail?: string }
  /**
   * Not enough information to rule. Deliberately NOT the same as clear — the
   * caller must surface this rather than quietly treating it as a pass.
   */
  | { status: "unverified"; message: string; missing: string[] }
  /** Checked and clear. `pravaraChecked` says how deep that check reached. */
  | { status: "clear"; pravaraChecked: boolean };

/**
 * VEDIC_DATA keys drifted from the canonical gothra names over time. Rather
 * than rename either list — both are referenced elsewhere — this maps between
 * them, so the pravara data is reachable for every gothra that has it.
 */
const PRAVARA_KEY_BY_GOTHRA: Record<string, string> = {
  Harita: "harithasa",
  Kaushika: "kausika",
  Garga: "gargya",
  Upamanya: "upamanyu",
  Parasara: "parashara",
  Vasishtha: "vashishta",
};

type PravaraRecord = { pravara_options?: string[]; description?: string };

function pravaraRecordFor(gothra: Gothra): PravaraRecord | undefined {
  const table = VEDIC_DATA.gothras as Record<string, PravaraRecord>;
  const key = PRAVARA_KEY_BY_GOTHRA[gothra.name] ?? gothra.name.toLowerCase();
  return table[key];
}

/** How many of the 30 gothras we can actually check pravara for. */
export function gothrasWithPravaraData(): string[] {
  return GOTHRAS.filter((g) => (pravaraRecordFor(g)?.pravara_options?.length ?? 0) > 0).map(
    (g) => g.name,
  );
}

/**
 * "Angirasa - Barhaspatya - Bharadwaja (3 Rishis)" → the three rishi names.
 * The trailing count is descriptive, not data, so it is discarded.
 */
function parseRishis(line: string): string[] {
  return line
    .replace(/\([^)]*\)/g, "")
    .split(/[-–—,]/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Every rishi line this person could plausibly have.
 *
 * Their own stated pravara, when given, is the single answer. Otherwise it is
 * whichever lines their gothra admits — Gargya, for instance, has two.
 *
 * Returning all candidates rather than one is what lets the caller distinguish
 * "certainly overlaps" from "might overlap". An earlier version returned a
 * single line and gave up when a gothra had several, which quietly reproduced
 * the fail-open behaviour this module was written to remove: unsure was being
 * reported as clear.
 */
function candidateRishiLines(input: ExogamyInput, gothra: Gothra): string[][] {
  if (input.pravara && input.pravara.trim()) {
    const parsed = parseRishis(input.pravara);
    if (parsed.length) return [parsed];
  }

  return (pravaraRecordFor(gothra)?.pravara_options ?? [])
    .map(parseRishis)
    .filter((line) => line.length > 0);
}

function sharedRishis(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return a.filter((rishi) => setB.has(rishi));
}

/** Resolves to the canonical gothra, by id where present, else by exact name. */
function canonicalGothra(input: ExogamyInput): Gothra | null {
  if (input.gothra_id != null) {
    const byId = GOTHRAS.find((g) => g.id === input.gothra_id);
    if (byId) return byId;
  }

  if (input.gothra && input.gothra.trim()) {
    const result = resolveGothra(input.gothra);
    if (result.status === "resolved") return result.match;
  }

  return null;
}

/**
 * The exogamy ruling for a pair.
 *
 * Order matters: same gothra is decided first and on its own, because it is the
 * rule members know by name and the one they expect to be told about.
 */
export function checkExogamy(a: ExogamyInput, b: ExogamyInput): ExogamyVerdict {
  const gothraA = canonicalGothra(a);
  const gothraB = canonicalGothra(b);

  if (!gothraA || !gothraB) {
    const missing: string[] = [];
    if (!gothraA) missing.push("the first profile's Gothra");
    if (!gothraB) missing.push("the second profile's Gothra");
    return {
      status: "unverified",
      missing,
      message:
        "Gothra has not been confirmed for both families, so the exogamy check could not be completed. Please confirm it before proceeding.",
    };
  }

  if (gothraA.id === gothraB.id) {
    return {
      status: "blocked",
      rule: "sagothra",
      message: "Same Gothra — not permitted by Vedic tradition.",
      detail: `Both families are of ${gothraA.name} Gothra.`,
    };
  }

  const linesA = candidateRishiLines(a, gothraA);
  const linesB = candidateRishiLines(b, gothraB);

  // No pravara data for one side or the other. The gothra check stands; the
  // deeper one simply did not happen, and `pravaraChecked` says so.
  if (!linesA.length || !linesB.length) {
    return { status: "clear", pravaraChecked: false };
  }

  // Traditional practice discourages marriage between families whose pravara
  // lines overlap even where the gothras differ, so a single shared rishi is
  // enough — the full line need not match.
  const pairs = linesA.flatMap((lineA) =>
    linesB.map((lineB) => sharedRishis(lineA, lineB)),
  );
  const overlapping = pairs.filter((shared) => shared.length > 0);

  const title = (r: string) => r.charAt(0).toUpperCase() + r.slice(1);
  const describe = (shared: string[]) =>
    `${shared.length === 1 ? "the rishi" : "the rishis"} ${shared.map(title).join(", ")}`;

  // Every possible combination overlaps, so it overlaps whichever line each
  // family actually recites. This is a certainty, not a caution.
  if (overlapping.length === pairs.length) {
    return {
      status: "blocked",
      rule: "sapravara",
      message: "Shared Pravara lineage — traditionally not permitted.",
      detail: `${gothraA.name} and ${gothraB.name} share ${describe(overlapping[0])}.`,
    };
  }

  // Some combinations overlap and some do not, which means the answer depends
  // on the exact line each family recites. Saying "clear" here would be a
  // guess in the permissive direction on the one question we must not guess at.
  if (overlapping.length > 0) {
    return {
      status: "unverified",
      missing: ["the exact Pravara line for both families"],
      message:
        `${gothraA.name} and ${gothraB.name} have Pravara lines that may share ` +
        `${describe(overlapping[0])}. Please confirm the line your families recite before proceeding.`,
    };
  }

  return { status: "clear", pravaraChecked: true };
}
