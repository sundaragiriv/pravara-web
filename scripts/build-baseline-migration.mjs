/**
 * Turns the CSV from scripts/sql/dump-baseline-ddl.sql into a real migration.
 *
 *   npm run db:baseline -- path/to/downloaded.csv
 *
 * The repository cannot currently rebuild the database. `profiles` — the
 * central table of the product — is created by no migration, nor are
 * `connections`, `notifications` or `photo_access`, and `match_guna_scores` is
 * declared by a migration but exists in neither database. The schema was built
 * by hand in the SQL editor, so the two live databases are not a copy of the
 * truth, they are the truth.
 *
 * This closes that. Run the dump query against production, download the CSV,
 * and pass it here; the output is supabase/migrations/000_baseline.sql, which
 * can recreate the schema from empty.
 */

import { readFileSync, writeFileSync } from "node:fs";

const OUT = "supabase/migrations/000_baseline.sql";

/**
 * Minimal RFC 4180 reader. Written by hand rather than pulled in as a
 * dependency, and because the DDL is full of quoted newlines and doubled
 * quotes — a naive split on commas would silently corrupt policy bodies, which
 * is the one part of this we cannot afford to get subtly wrong.
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

const file = process.argv[2];
if (!file) {
  console.error("Usage: npm run db:baseline -- path/to/downloaded.csv");
  process.exit(1);
}

const rows = parseCsv(readFileSync(file, "utf8"));
if (rows.length < 2) {
  console.error("That file has no rows.");
  process.exit(1);
}

const header = rows[0].map((h) => h.trim().toLowerCase());
const iPart = header.indexOf("part");
const iKind = header.indexOf("kind");
const iName = header.indexOf("name");
const iDdl = header.indexOf("ddl");

if (iDdl === -1) {
  console.error(`No "ddl" column. Found: ${header.join(", ")}`);
  process.exit(1);
}

const statements = rows
  .slice(1)
  .filter((r) => r[iDdl]?.trim())
  .map((r) => ({
    part: Number(r[iPart] ?? 0),
    kind: r[iKind] ?? "",
    name: r[iName] ?? "",
    ddl: r[iDdl].trim(),
  }))
  .sort((a, b) => a.part - b.part || a.name.localeCompare(b.name));

const GROUP_TITLES = {
  1: "Extensions",
  2: "Tables",
  3: "Primary keys, unique and check constraints",
  4: "Foreign keys — after every table exists",
  5: "Indexes",
  6: "Functions",
  7: "Triggers",
  8: "Row level security",
  9: "Policies",
};

const lines = [
  "-- ============================================================",
  "-- BASELINE — the schema as it actually is",
  "--",
  "-- Generated from the production database by",
  "-- scripts/sql/dump-baseline-ddl.sql, because the schema was built by",
  "-- hand in the SQL editor and the migrations in this directory do not",
  "-- describe it. `profiles` itself appeared in none of them.",
  "--",
  "-- This file is the starting point: run it against an empty database and",
  "-- every later migration here applies on top. Do not hand-edit it —",
  "-- regenerate it if the schema moves.",
  "--",
  "-- Every statement is IF NOT EXISTS or additive where Postgres allows, so",
  "-- running it against a populated database should be a no-op rather than a",
  "-- disaster. Constraint and policy creation are not idempotent, so expect",
  "-- \"already exists\" errors there if you do — that is the safe direction.",
  "-- ============================================================",
  "",
];

let currentPart = null;
for (const statement of statements) {
  if (statement.part !== currentPart) {
    currentPart = statement.part;
    lines.push("");
    lines.push(`-- ── ${GROUP_TITLES[currentPart] ?? `Part ${currentPart}`} ──`);
    lines.push("");
  }
  lines.push(statement.ddl);
  lines.push("");
}

writeFileSync(OUT, lines.join("\n"), "utf8");

const counts = statements.reduce((acc, s) => {
  acc[s.kind] = (acc[s.kind] ?? 0) + 1;
  return acc;
}, {});

console.log(`Wrote ${OUT}`);
for (const [kind, n] of Object.entries(counts).sort()) {
  console.log(`  ${String(n).padStart(4)}  ${kind}`);
}
console.log(`\n  ${statements.length} statements total`);
console.log("\nCheck that `profiles`, `connections`, `notifications` and");
console.log("`photo_access` are among the tables — those are the ones no");
console.log("migration ever created.");
