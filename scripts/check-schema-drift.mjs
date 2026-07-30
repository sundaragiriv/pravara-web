/**
 * Compares the pravara-dev and production schemas and reports every difference.
 *
 * Dev and production are separate Supabase projects, so nothing propagates
 * between them. Anything added to one must be added to the other, and the only
 * way that stays true is if it is checked rather than remembered.
 *
 * Read-only — never writes to either project.
 *
 *   node scripts/check-schema-drift.mjs
 *
 * Exits non-zero when drift is found, so it can gate a release.
 */

import { readFileSync } from "node:fs";

function readEnv(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const dev = readEnv(".env.development.local");
const prod = readEnv(".env.local");

const TARGETS = [
  { label: "dev ", url: dev.NEXT_PUBLIC_SUPABASE_URL, key: dev.SUPABASE_SERVICE_ROLE_KEY },
  { label: "prod", url: prod.NEXT_PUBLIC_SUPABASE_URL, key: prod.SUPABASE_SERVICE_ROLE_KEY },
];

for (const t of TARGETS) {
  if (!t.url || !t.key) {
    console.error(`Missing Supabase URL or service-role key for ${t.label.trim()}`);
    process.exit(1);
  }
}

async function schemaOf({ url, key }) {
  const res = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const spec = await res.json();
  const tables = {};
  for (const [name, def] of Object.entries(spec.definitions || {})) {
    tables[name] = new Set(Object.keys(def.properties || {}));
  }
  return tables;
}

const [devSchema, prodSchema] = await Promise.all(TARGETS.map(schemaOf));

const ref = (u) => (u.match(/https:\/\/([a-z]{20})\./) || [])[1] || u;
console.log(`dev  ${ref(TARGETS[0].url)}   ${Object.keys(devSchema).length} tables`);
console.log(`prod ${ref(TARGETS[1].url)}   ${Object.keys(prodSchema).length} tables\n`);

const allTables = [...new Set([...Object.keys(devSchema), ...Object.keys(prodSchema)])].sort();
const problems = [];

for (const table of allTables) {
  const inDev = devSchema[table];
  const inProd = prodSchema[table];

  if (inDev && !inProd) {
    problems.push({ kind: "table", where: "dev only", detail: table });
    continue;
  }
  if (!inDev && inProd) {
    problems.push({ kind: "table", where: "prod only", detail: table });
    continue;
  }

  const devOnly = [...inDev].filter((c) => !inProd.has(c)).sort();
  const prodOnly = [...inProd].filter((c) => !inDev.has(c)).sort();

  for (const c of devOnly) problems.push({ kind: "column", where: "dev only", detail: `${table}.${c}` });
  for (const c of prodOnly) problems.push({ kind: "column", where: "prod only", detail: `${table}.${c}` });
}

if (!problems.length) {
  console.log("No drift — dev and production schemas match.");
  process.exit(0);
}

const devOnly = problems.filter((p) => p.where === "dev only");
const prodOnly = problems.filter((p) => p.where === "prod only");

if (devOnly.length) {
  console.log(`IN DEV, MISSING FROM PRODUCTION  (${devOnly.length})`);
  console.log("  These ship broken unless the SQL is run against prod first.");
  for (const p of devOnly) console.log(`    ${p.kind.padEnd(7)} ${p.detail}`);
  console.log();
}

if (prodOnly.length) {
  console.log(`IN PRODUCTION, MISSING FROM DEV  (${prodOnly.length})`);
  console.log("  Dev cannot reproduce production behaviour for these.");
  for (const p of prodOnly) console.log(`    ${p.kind.padEnd(7)} ${p.detail}`);
  console.log();
}

console.log(`${problems.length} difference(s). Reconcile before releasing.`);
process.exit(1);
