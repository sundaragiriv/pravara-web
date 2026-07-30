/**
 * Completes the pravara-dev test environment:
 *   1. Avatars  — generated SVGs uploaded to the `avatars` bucket, set on every
 *                 seeded profile so cards and match results are not blank.
 *   2. Leads    — rows in launch_registrations, so /admin/registrants has
 *                 something in it and the founder counter can be exercised.
 *
 * Deliberately NOT using photographs of real people (Unsplash is CSP-allowed
 * and would have been easy). Putting real faces on fabricated matrimony
 * profiles is distasteful, and a screenshot escaping into a deck or a demo
 * would be worse. These are clearly illustrations.
 *
 *   node scripts/seed-dev-extras.mjs           # avatars + leads
 *   node scripts/seed-dev-extras.mjs --purge   # remove seeded leads
 */

import { readFileSync } from "node:fs";

const DEV_PROJECT_REF = "ikzifuotttucelvugjyy";
const SEED_SOURCE = "seed-dev";
const BUCKET = "avatars";

function readEnv(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = readEnv(".env.development.local");
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_?.includes(DEV_PROJECT_REF)) {
  console.error(`Refusing to run: expected ${DEV_PROJECT_REF}, got ${URL_}`);
  process.exit(1);
}

const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const JH = { ...H, "Content-Type": "application/json" };

async function rest(path, init = {}) {
  const res = await fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { ...JH, ...init.headers } });
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} -> ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json().catch(() => null);
}

let seed = 77712026;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (a) => a[Math.floor(rand() * a.length)];
const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));

// ── Avatars ────────────────────────────────────────────────────────────────
// Brand palette. Warm golds for one silhouette, deeper kumkum reds for the
// other — distinguishable at a glance without resorting to pink/blue.
const PALETTE = {
  Male: [["#3B2D1E", "#C9A24A"], ["#2E2418", "#B8860B"], ["#3A2B17", "#E8C56B"]],
  Female: [["#3A1E20", "#D08C6A"], ["#33191C", "#C9A24A"], ["#2E1A1C", "#E0A96D"]],
};

function avatarSvg(initial, gender) {
  const [bg, fg] = pick(PALETTE[gender] ?? PALETTE.Male);
  // Female silhouette gets a wider shoulder curve and longer hair mass; male a
  // narrower head and squarer shoulders. Crude, but readable at card size.
  const figure =
    gender === "Female"
      ? `<circle cx="100" cy="78" r="30" fill="${fg}" opacity="0.9"/>
         <path d="M56 84c0-26 20-44 44-44s44 18 44 44c0 14-6 20-10 20 2-30-16-40-34-40S66 74 66 104c-4 0-10-6-10-20z" fill="${fg}" opacity="0.55"/>
         <path d="M100 118c-30 0-52 20-56 48h112c-4-28-26-48-56-48z" fill="${fg}" opacity="0.75"/>`
      : `<circle cx="100" cy="80" r="27" fill="${fg}" opacity="0.9"/>
         <path d="M100 116c-28 0-48 18-52 44h104c-4-26-24-44-52-44z" fill="${fg}" opacity="0.75"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${bg}"/><stop offset="100%" stop-color="#0C0A09"/>
  </linearGradient></defs>
  <rect width="200" height="200" fill="url(#g)"/>
  ${figure}
  <text x="100" y="192" text-anchor="middle" font-family="Georgia,serif" font-size="15"
        fill="${fg}" opacity="0.65" letter-spacing="3">${initial}</text>
</svg>`;
}

async function upload(path, body, contentType) {
  const res = await fetch(`${URL_}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { ...H, "Content-Type": contentType, "x-upsert": "true" },
    body,
  });
  if (!res.ok && res.status !== 409) throw new Error(`upload ${path} -> ${res.status} ${await res.text()}`);
  return `${URL_}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function seedAvatars() {
  const profiles = await rest("profiles?select=id,full_name,gender&bio=like.*%5Bseed%5D*");
  if (!profiles?.length) {
    console.log("No seeded profiles found — run seed-dev-profiles.mjs first.");
    return;
  }

  let done = 0;
  for (const p of profiles) {
    const svg = avatarSvg((p.full_name || "?").trim()[0].toUpperCase(), p.gender);
    const url = await upload(`${p.id}.svg`, svg, "image/svg+xml");
    await rest(`profiles?id=eq.${p.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ image_url: url }),
    });
    done++;
    if (done % 20 === 0 || done === profiles.length) process.stdout.write(`\r  avatars ${done}/${profiles.length}`);
  }
  console.log();
}

// ── Leads ──────────────────────────────────────────────────────────────────
// Above FOUNDER_COUNT_DISPLAY_THRESHOLD (75) on purpose, so the public counter
// actually renders in dev — otherwise that branch can only be tested by faking
// the number, which is how it stayed untested until now.
const LEAD_COUNT = 92;

const LEAD_NAMES = [
  ["Aditya", "Vemuri"], ["Sravani", "Kolluri"], ["Karthik", "Iyer"], ["Deepika", "Rao"],
  ["Nikhil", "Deshpande"], ["Ananya", "Bhat"], ["Rahul", "Sharma"], ["Meghana", "Ganti"],
  ["Balaji", "Subramanian"], ["Ketaki", "Gokhale"], ["Vinay", "Joshi"], ["Nithya", "Krishnan"],
  ["Siddharth", "Mishra"], ["Harika", "Peddinti"], ["Ganesh", "Iyengar"], ["Pallavi", "Hegde"],
];
const LEAD_COUNTRIES = [
  ...Array(38).fill({ code: "IN", dial: "91", city: "Hyderabad" }),
  ...Array(34).fill({ code: "US", dial: "1", city: "Edison" }),
  ...Array(20).fill({ code: "CA", dial: "1", city: "Toronto" }),
];

async function purgeLeads() {
  const existing = await rest(`launch_registrations?select=id&source=eq.${SEED_SOURCE}`);
  if (!existing?.length) return console.log("No seeded leads to remove.");
  await rest(`launch_registrations?source=eq.${SEED_SOURCE}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  console.log(`Removed ${existing.length} seeded leads.`);
}

async function seedLeads() {
  await purgeLeads();
  const rows = [];
  for (let i = 0; i < LEAD_COUNT; i++) {
    const [given, surname] = pick(LEAD_NAMES);
    const c = pick(LEAD_COUNTRIES);
    rows.push({
      full_name: `${given} ${surname}`,
      age: int(23, 36),
      gender: i % 2 === 0 ? "Male" : "Female",
      email: `${given}.${surname}${i}`.toLowerCase() + "@lead.pravara.test",
      phone: `+${c.dial}${int(700000000, 999999999)}`,
      country: c.code,
      profession: "",
      location: c.city,
      source: SEED_SOURCE,
      status: rand() < 0.12 ? "approved" : "registered",
    });
  }
  await rest("launch_registrations", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(rows),
  });
  const byCountry = rows.reduce((a, r) => ((a[r.country] = (a[r.country] || 0) + 1), a), {});
  console.log(`  ${rows.length} leads — ${Object.entries(byCountry).map(([k, v]) => `${k} ${v}`).join(", ")}`);
}

const purge = process.argv.includes("--purge");

if (purge) {
  await purgeLeads();
} else {
  console.log("Avatars:");
  await seedAvatars();
  console.log("Leads:");
  await seedLeads();
  console.log(`\nDone. Counter threshold is 75, so ${LEAD_COUNT} leads makes it render.`);
}
