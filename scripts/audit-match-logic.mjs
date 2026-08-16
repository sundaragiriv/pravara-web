/**
 * Is the matching real, or is the seed data just decorative?
 *
 *   npm run audit:matching
 *
 * A dashboard full of plausible numbers proves nothing on its own — a fixture
 * with a hardcoded `score` column would look identical. This recomputes the
 * Ashtakoot engine over the actual dev profiles and reports what it finds, so
 * the answer is evidence rather than assurance.
 *
 * Checks, in order of how badly a failure would matter:
 *   1. Do the Vedic inputs resolve? A profile whose nakshatra does not match
 *      the table scores from nothing.
 *   2. Is the score distribution varied? All-identical scores mean the engine
 *      is not reading the data.
 *   3. Does sagotra actually block, on real pairs from the data?
 *   4. Does Pravara block where gotras differ but lineages overlap?
 *   5. How much of the data can be checked to Pravara depth at all?
 */

import { readFileSync } from "node:fs";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

const root = process.cwd().split("\\").join("/");
const hook = [
  'import { pathToFileURL } from "node:url";',
  `const ROOT = ${JSON.stringify(root)};`,
  "export async function resolve(specifier, context, next) {",
  '  if (specifier === "server-only") return { url: "data:text/javascript,", shortCircuit: true };',
  '  if (specifier.startsWith("@/")) {',
  '    let p = ROOT + "/" + specifier.slice(2);',
  '    if (!/\\.(ts|tsx|js|mjs|json)$/.test(p)) p += ".ts";',
  "    return next(pathToFileURL(p).href, context);",
  "  }",
  "  return next(specifier, context);",
  "}",
].join("\n");
register(`data:text/javascript,${encodeURIComponent(hook)}`, pathToFileURL("./"));

function readEnv(file) {
  const out = {};
  try {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* file may not exist */
  }
  return out;
}

const env = readEnv(".env.development.local");
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const svc = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
};

const { calculateGunaScore } = await import("@/utils/matchEngine");
const { checkExogamy, gothrasWithPravaraData } = await import("@/utils/exogamy");
const { resolveGothra } = await import("@/utils/community-data");
const { NAKSHATRAS } = await import("@/utils/vedic-data");

const profiles = await (
  await fetch(
    `${URL_BASE}/rest/v1/profiles?select=id,full_name,gender,age,gothra,pravara,nakshatra,raasi&limit=500`,
    { headers: svc },
  )
).json();

console.log(`${profiles.length} profiles.\n`);

// ── 1. Do the Vedic inputs resolve? ─────────────────────────────────────────

const nakNames = new Set(
  NAKSHATRAS.flatMap((n) => [n.name.toLowerCase(), ...n.altNames.map((a) => a.toLowerCase())]),
);

const badGothra = profiles.filter(
  (p) => p.gothra && resolveGothra(p.gothra).status !== "resolved",
);
const badNakshatra = profiles.filter(
  (p) => p.nakshatra && !nakNames.has(p.nakshatra.toLowerCase().trim()),
);
const noGothra = profiles.filter((p) => !p.gothra);
const noNakshatra = profiles.filter((p) => !p.nakshatra);

console.log("1. INPUTS");
console.log(`   gothra unrecognised : ${badGothra.length}${badGothra.length ? "  " + [...new Set(badGothra.map((p) => p.gothra))].slice(0, 5).join(", ") : ""}`);
console.log(`   nakshatra unrecognised : ${badNakshatra.length}${badNakshatra.length ? "  " + [...new Set(badNakshatra.map((p) => p.nakshatra))].slice(0, 5).join(", ") : ""}`);
console.log(`   missing gothra / nakshatra : ${noGothra.length} / ${noNakshatra.length}`);

// ── 2. Is the score distribution real? ──────────────────────────────────────

const women = profiles.filter((p) => p.gender === "Female");
const men = profiles.filter((p) => p.gender === "Male");
const subject = women[0];

const scored = men
  .map((m) => ({ name: m.full_name, result: calculateGunaScore(m, subject) }))
  .filter((r) => r.result);

const totals = scored.map((s) => s.result.total);
const distinct = new Set(totals).size;
const blocked = scored.filter((s) => s.result.sagothra);
const unverified = scored.filter((s) => s.result.exogamy?.status === "unverified");

console.log(`\n2. SCORES  (${subject.full_name}, ${subject.gothra}, ${subject.nakshatra} vs ${men.length} men)`);
console.log(`   range      : ${Math.min(...totals)} – ${Math.max(...totals)} of 36`);
console.log(`   distinct values : ${distinct}${distinct < 5 ? "   <- suspiciously flat" : "   (varied, so the engine is reading the data)"}`);
const buckets = { "Uttama 27+": 0, "Madhyama 18-26": 0, "Alpa <18": 0, Blocked: 0 };
for (const s of scored) {
  if (s.result.sagothra) buckets.Blocked += 1;
  else if (s.result.total >= 27) buckets["Uttama 27+"] += 1;
  else if (s.result.total >= 18) buckets["Madhyama 18-26"] += 1;
  else buckets["Alpa <18"] += 1;
}
for (const [label, n] of Object.entries(buckets)) console.log(`   ${label.padEnd(16)} ${n}`);
console.log(`   exogamy unverified : ${unverified.length}`);

// ── 3 & 4. Does the exogamy rule actually fire on this data? ────────────────

console.log("\n3. EXOGAMY, on real pairs from the data");

let sagotraFound = 0;
let sapravaraFound = 0;
let clearFound = 0;
const examples = { sagothra: null, sapravara: null };

for (const w of women.slice(0, 40)) {
  for (const m of men) {
    const verdict = checkExogamy(w, m);
    if (verdict.status === "blocked" && verdict.rule === "sagothra") {
      sagotraFound += 1;
      examples.sagothra ??= `${w.full_name} (${w.gothra}) x ${m.full_name} (${m.gothra})`;
    } else if (verdict.status === "blocked" && verdict.rule === "sapravara") {
      sapravaraFound += 1;
      examples.sapravara ??= `${w.full_name} (${w.gothra}) x ${m.full_name} (${m.gothra}) — ${verdict.detail}`;
    } else if (verdict.status === "clear") {
      clearFound += 1;
    }
  }
}

console.log(`   blocked, same gothra   : ${sagotraFound}`);
if (examples.sagothra) console.log(`     e.g. ${examples.sagothra}`);
console.log(`   blocked, shared pravara: ${sapravaraFound}`);
if (examples.sapravara) console.log(`     e.g. ${examples.sapravara}`);
console.log(`   cleared                : ${clearFound}`);

// ── 5. Coverage ─────────────────────────────────────────────────────────────

const withPravara = gothrasWithPravaraData();
const gothrasInUse = [...new Set(profiles.map((p) => p.gothra).filter(Boolean))];
const covered = gothrasInUse.filter((g) => {
  const r = resolveGothra(g);
  return r.status === "resolved" && withPravara.includes(r.match.name);
});

console.log("\n4. COVERAGE");
console.log(`   distinct gothras in the data : ${gothrasInUse.length}`);
console.log(`   of those, Pravara data exists for : ${covered.length}`);
console.log(`   profiles stating their own Pravara : ${profiles.filter((p) => p.pravara).length}`);

console.log("\nEverything above is computed from the profiles at run time.");
console.log("No score is stored on a profile row; the engine derives all of it.");
