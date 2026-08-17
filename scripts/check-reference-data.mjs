/**
 * Invariants for the community, gothra and nakshatra reference data.
 *
 *   npm run check:data
 *
 * These are not unit tests of behaviour so much as guards against a specific
 * way this data goes wrong: someone adds a plausible alternate spelling to one
 * entry without noticing it already belongs to another. That is exactly how
 * `koushika` came to sit under both Kaundinya and Kaushika, and because the
 * lookup used `.find()` the damage was silent — Kaushika families were simply
 * stored as Kaundinya, and the exogamy check answered a different question than
 * the one it was asked.
 *
 * Cheap, offline, no dependencies. Run it whenever the reference data changes.
 */

import { register } from "node:module";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd().split("\\").join("/");

// Node cannot resolve the "@/" tsconfig alias on its own.
const hook = [
  'import { pathToFileURL } from "node:url";',
  `const ROOT = ${JSON.stringify(ROOT)};`,
  "export async function resolve(specifier, context, next) {",
  '  if (specifier.startsWith("@/")) {',
  '    let p = ROOT + "/" + specifier.slice(2);',
  '    if (!/\\.(ts|tsx|js|mjs|json)$/.test(p)) p += ".ts";',
  "    return next(pathToFileURL(p).href, context);",
  "  }",
  "  return next(specifier, context);",
  "}",
].join("\n");
register(`data:text/javascript,${encodeURIComponent(hook)}`, pathToFileURL("./"));
const data = await import(pathToFileURL(`${ROOT}/utils/community-data.ts`).href);
const vedic = await import(pathToFileURL(`${ROOT}/utils/vedic-data.ts`).href);

const {
  GOTHRAS,
  COMMUNITIES,
  SUB_COMMUNITIES,
  resolveGothra,
  resolveCommunity,
  resolveSubCommunity,
} = data;

const failures = [];
const checks = [];

function assert(condition, label, detail = "") {
  checks.push(label);
  if (condition) {
    process.stdout.write(".");
  } else {
    process.stdout.write("x");
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
  }
}

/** Every accepted spelling for a row, lowercased, deduplicated. */
function keysOf(row) {
  return [...new Set([row.name, ...row.altNames].map((k) => k.toLowerCase().trim()))];
}

/**
 * No two rows in the same scope may accept the same string. Scope is the whole
 * list for gothras, the language for communities, and the parent community for
 * sub-communities — because that is the narrowest context the picker can
 * guarantee at the point of resolution.
 */
function assertNoCollisions(label, rows, scopeOf) {
  const index = new Map();
  for (const row of rows) {
    for (const key of keysOf(row)) {
      const composite = `${scopeOf(row)}::${key}`;
      if (!index.has(composite)) index.set(composite, []);
      index.get(composite).push(row.name);
    }
  }
  const collisions = [...index].filter(([, owners]) => new Set(owners).size > 1);
  assert(
    collisions.length === 0,
    `${label}: no colliding names within scope`,
    collisions.map(([k, v]) => `${k} -> ${[...new Set(v)].join(" / ")}`).join("; "),
  );
}

assertNoCollisions("GOTHRAS", GOTHRAS, () => "all");
assertNoCollisions("COMMUNITIES", COMMUNITIES, (c) => `lang:${c.languageId}`);
assertNoCollisions("SUB_COMMUNITIES", SUB_COMMUNITIES, (s) => `comm:${s.communityId}`);
assertNoCollisions("NAKSHATRAS", vedic.NAKSHATRAS, () => "all");

// The specific regression. Worth naming outright so a future edit that
// reintroduces it fails against the reason rather than a generic message.
assert(
  resolveGothra("koushika").status === "resolved" &&
    resolveGothra("koushika").match.name === "Kaushika",
  "koushika resolves to Kaushika, not Kaundinya",
);

// Matching stays exact. A near-miss must not be helpfully corrected: names one
// character apart can belong to entirely different communities, and in some
// regions to different caste categories altogether.
for (const nearMiss of ["bharadwajj", "kashyapaa", "gautamm", "sandily"]) {
  assert(
    resolveGothra(nearMiss).status === "unknown",
    `"${nearMiss}" is not fuzzily corrected`,
  );
}

// Ambiguity must surface as ambiguity rather than as a silent first-match.
assert(resolveCommunity("smartha").status === "ambiguous", "unscoped 'smartha' is ambiguous");
assert(resolveCommunity("saraswat").status === "ambiguous", "unscoped 'saraswat' is ambiguous");
assert(
  resolveSubCommunity("mulakanadu").status === "ambiguous",
  "unscoped 'mulakanadu' is ambiguous",
);

// ...and scoping must resolve it, which is the whole argument for asking
// language first in the picker.
assert(
  resolveCommunity("smartha", { languageId: 2 }).match?.name === "Iyer",
  "'smartha' scoped to Tamil resolves to Iyer",
);
assert(
  resolveCommunity("smartha", { languageId: 3 }).match?.name === "Smartha",
  "'smartha' scoped to Kannada resolves to Smartha",
);

/**
 * Terms the taxonomy research identified as slurs, as Scheduled Caste or OBC
 * names wrongly assumed Brahmin, or as status ranks rather than identities.
 * None of them may resolve to anything. See
 * docs/reference/community-taxonomy-research.md.
 */
const MUST_NOT_RESOLVE = [
  "khasa", "khasiya", "khasia", "pitali", "hali", "nan-dhoti",
  "agradani", "mahabrahmin", "kattaha", "ghatiya", "jugi",
  "thuljat", "bhalbaman", "halbaha", "halbi",
  "batwal", "ghirth", "kalita", "baidya", "belwar",
  "babhan", "taga",
];

for (const term of MUST_NOT_RESOLVE) {
  const hit =
    resolveGothra(term).status !== "unknown" ||
    resolveCommunity(term).status !== "unknown" ||
    resolveSubCommunity(term).status !== "unknown";
  assert(!hit, `blocked term "${term}" resolves to nothing`);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXOGAMY — the rule the platform exists to honour
// ─────────────────────────────────────────────────────────────────────────────

const { checkExogamy, gothrasWithPravaraData } = await import(
  pathToFileURL(`${ROOT}/utils/exogamy.ts`).href
);

const G = (gothra, pravara) => ({ gothra, pravara });

// The bug that mattered most: one gothra, two ordinary spellings, previously
// compared unequal and the pair was cleared to marry.
for (const [x, y] of [
  ["Bharadwaja", "Bhardwaj"],
  ["Kashyapa", "Kashyap"],
  ["Vasishtha", "Vashishtha"],
  ["Vishwamitra", "viswamitra"],
  ["  gautam  ", "Gautama"],
]) {
  const verdict = checkExogamy(G(x), G(y));
  assert(
    verdict.status === "blocked" && verdict.rule === "sagothra",
    `"${x.trim()}" vs "${y}" is caught as sagothra`,
    `got ${verdict.status}`,
  );
}

// Different gothras with no pravara overlap must still pass.
{
  const verdict = checkExogamy(G("Bharadwaja"), G("Kashyapa"));
  assert(verdict.status === "clear", "Bharadwaja vs Kashyapa is clear");
}

// Pravara overlap across DIFFERENT gothras — the case the engine ignored
// entirely. Bharadwaja's line sits inside Gargya's.
{
  const verdict = checkExogamy(G("Bharadwaja"), G("Garga"));
  assert(
    verdict.status === "blocked" && verdict.rule === "sapravara",
    "Bharadwaja vs Garga is blocked on shared Pravara",
    `got ${verdict.status}${verdict.rule ? `/${verdict.rule}` : ""}`,
  );
}

// Missing gothra must be reported as unverified, never as a pass.
for (const [label, a, b] of [
  ["both missing", G(null), G(null)],
  ["one missing", G("Bharadwaja"), G(null)],
  ["one unrecognised", G("Bharadwaja"), G("Zzzz")],
]) {
  const verdict = checkExogamy(a, b);
  assert(
    verdict.status === "unverified",
    `exogamy with ${label} reports unverified, not clear`,
    `got ${verdict.status}`,
  );
}

// The koushika collision, end to end: two Kaushika families must be caught.
{
  const verdict = checkExogamy(G("koushika"), G("Kaushika"));
  assert(
    verdict.status === "blocked" && verdict.rule === "sagothra",
    "two Kaushika families are caught regardless of spelling",
  );
}

// A member's own stated Pravara is honoured over the gothra default.
{
  const verdict = checkExogamy(
    G("Kashyapa", "Kashyapa - Avatsara - Naidhruva (3 Rishis)"),
    G("Naidhruva", "Kashyapa - Avatsara - Naidhruva (3 Rishis)"),
  );
  assert(
    verdict.status === "blocked" && verdict.rule === "sapravara",
    "identical stated Pravara blocks across different gothras",
    `got ${verdict.status}`,
  );
}

// How much of the list we can actually check to Pravara depth. Not a pass/fail
// on correctness — a standing reminder of the coverage gap.
const withPravara = gothrasWithPravaraData();
console.log(
  `\n  Pravara data covers ${withPravara.length}/${GOTHRAS.length} gothras: ${withPravara.join(", ")}`,
);

console.log(`\n${checks.length - failures.length}/${checks.length} checks passed\n`);

if (failures.length) {
  for (const failure of failures) console.log(`FAIL  ${failure}`);
  process.exit(1);
}

console.log("Reference data is consistent.");
