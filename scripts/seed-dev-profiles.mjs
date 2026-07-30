/**
 * Seeds pravara-dev with believable member profiles.
 *
 * Refuses to run against anything but the dev project — seeding production
 * would be unrecoverable without knowing which rows were fake.
 *
 * Values come from the app's own reference tables (ref_gothras, ref_nakshatras,
 * ref_raasis, ref_communities), so nakshatra→raasi pairings are astrologically
 * valid and compatibility logic gets real inputs rather than noise.
 *
 *   node scripts/seed-dev-profiles.mjs           # seed 50
 *   node scripts/seed-dev-profiles.mjs 120       # seed 120
 *   node scripts/seed-dev-profiles.mjs --purge   # remove seeded rows only
 */

import { readFileSync } from "node:fs";

const DEV_PROJECT_REF = "ikzifuotttucelvugjyy";
/** Seeded rows carry this in `bio` so --purge can find them and only them. */
const SEED_MARKER = "[seed]";

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

if (!URL_ || !KEY) {
  console.error("Missing Supabase vars in .env.development.local");
  process.exit(1);
}
if (!URL_.includes(DEV_PROJECT_REF)) {
  console.error(`Refusing to run: expected ${DEV_PROJECT_REF}, got ${URL_}`);
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

async function rest(path, init = {}) {
  const res = await fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { ...headers, ...init.headers } });
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} -> ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json().catch(() => null);
}

// ── Deterministic PRNG so reruns produce the same cohort ────────────────────
let seed = 20260730;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));

// ── Name pools, grouped so names match their community's language ───────────
const NAMES = {
  Telugu: {
    m: ["Sriram", "Venkat", "Aditya", "Karthik", "Sandeep", "Rohit", "Praveen", "Chaitanya"],
    f: ["Sravani", "Divya", "Harika", "Lavanya", "Meghana", "Swetha", "Anusha", "Keerthi"],
    s: ["Sundaragiri", "Kolluri", "Vemuri", "Peddinti", "Ganti", "Yellapragada", "Chintalapati"],
  },
  Tamil: {
    m: ["Arvind", "Mahesh", "Ganesh", "Srinivasan", "Balaji", "Ramanan", "Hariharan"],
    f: ["Lakshmi", "Janani", "Aishwarya", "Deepika", "Nithya", "Vaishnavi", "Shruti"],
    s: ["Iyer", "Iyengar", "Sastry", "Krishnan", "Subramanian", "Rajagopalan"],
  },
  Kannada: {
    m: ["Prashanth", "Vinay", "Rakesh", "Anirudh", "Sudhir", "Manjunath"],
    f: ["Shreya", "Pallavi", "Bhavana", "Ramya", "Sushma", "Ananya"],
    s: ["Bhat", "Joshi", "Rao", "Kulkarni", "Hegde", "Acharya"],
  },
  Marathi: {
    m: ["Omkar", "Nikhil", "Tejas", "Sachin", "Amey"],
    f: ["Mrunal", "Ketaki", "Sayali", "Aditi", "Rutuja"],
    s: ["Deshpande", "Gokhale", "Ranade", "Apte", "Karve"],
  },
  Hindi: {
    m: ["Abhishek", "Siddharth", "Gaurav", "Rahul", "Ankit"],
    f: ["Priya", "Neha", "Ishita", "Sakshi", "Radhika"],
    s: ["Sharma", "Trivedi", "Mishra", "Dubey", "Chaturvedi"],
  },
};

// The three launch markets, weighted so each has enough density for matching to
// return real results. An earlier pass gave Canada only 6 profiles, which meant
// a Canadian test account saw almost nothing — the exact failure a seeded
// environment exists to catch. Roughly India 40 / US 35 / Canada 25.
const LOCATIONS = [
  // India — 40
  { country: "India", state: "Telangana", city: "Hyderabad", w: 12 },
  { country: "India", state: "Karnataka", city: "Bengaluru", w: 10 },
  { country: "India", state: "Tamil Nadu", city: "Chennai", w: 8 },
  { country: "India", state: "Maharashtra", city: "Pune", w: 6 },
  { country: "India", state: "Delhi", city: "New Delhi", w: 4 },
  // United States — 35
  { country: "United States", state: "New Jersey", city: "Edison", w: 9 },
  { country: "United States", state: "California", city: "San Jose", w: 8 },
  { country: "United States", state: "Texas", city: "Dallas", w: 7 },
  { country: "United States", state: "Washington", city: "Seattle", w: 6 },
  { country: "United States", state: "Illinois", city: "Chicago", w: 5 },
  // Canada — 25
  { country: "Canada", state: "Ontario", city: "Toronto", w: 9 },
  { country: "Canada", state: "British Columbia", city: "Vancouver", w: 6 },
  { country: "Canada", state: "Ontario", city: "Mississauga", w: 5 },
  { country: "Canada", state: "Alberta", city: "Calgary", w: 3 },
  { country: "Canada", state: "Quebec", city: "Montreal", w: 2 },
];
const LOCATION_POOL = LOCATIONS.flatMap((l) => Array(l.w).fill(l));

const PROFESSIONS = [
  "Software Engineer", "Physician", "Data Scientist", "Chartered Accountant",
  "Product Manager", "Architect", "Dentist", "Research Scientist",
  "Civil Engineer", "Attorney", "Professor", "Pharmacist",
];
const EDUCATION = ["B.Tech", "M.Tech", "MBA", "MBBS", "MS (US)", "B.Com, CA", "PhD", "M.Sc"];
const DIETS = ["Vegetarian", "Vegetarian", "Vegetarian", "Vegan", "Eggetarian"];
const MANGLIK = ["No", "No", "No", "Yes", "Partial"];

const args = process.argv.slice(2);
const purge = args.includes("--purge");
const count = Number(args.find((a) => /^\d+$/.test(a))) || 50;

async function purgeSeeded() {
  const existing = await rest(`profiles?select=id&bio=like.*${encodeURIComponent(SEED_MARKER)}*`);
  if (!existing?.length) {
    console.log("Nothing seeded to remove.");
    return;
  }
  await rest(`profiles?bio=like.*${encodeURIComponent(SEED_MARKER)}*`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  console.log(`Removed ${existing.length} seeded profiles.`);
}

async function main() {
  if (purge) return purgeSeeded();

  const [gothras, nakshatras, communities, languages] = await Promise.all([
    rest("ref_gothras?select=id,name"),
    rest("ref_nakshatras?select=id,name,raasi"),
    rest("ref_communities?select=id,name,language_id"),
    rest("ref_languages?select=id,name"),
  ]);

  const langById = Object.fromEntries(languages.map((l) => [l.id, l.name]));

  // Clear any previous run so counts stay predictable.
  await purgeSeeded();

  const rows = [];
  for (let i = 0; i < count; i++) {
    const community = pick(communities);
    const language = langById[community.language_id] ?? "Hindi";
    const pool = NAMES[language] ?? NAMES.Hindi;

    const gender = i % 2 === 0 ? "Male" : "Female";
    const given = pick(gender === "Male" ? pool.m : pool.f);
    const surname = pick(pool.s);

    // Nakshatra decides raasi — picking them independently would produce
    // combinations that cannot exist and would poison compatibility scoring.
    const nak = pick(nakshatras);
    const gothra = pick(gothras);
    const loc = pick(LOCATION_POOL);

    const age = int(23, 37);
    const dob = new Date(Date.UTC(2026 - age, int(0, 11), int(1, 28)))
      .toISOString()
      .slice(0, 10);

    rows.push({
      id: crypto.randomUUID(),
      full_name: `${given} ${surname}`,
      email: `${given}.${surname}${i}`.toLowerCase() + "@seed.pravara.test",
      gender,
      dob,
      age,
      gothra: gothra.name,
      gothra_id: gothra.id,
      nakshatra: nak.name,
      nakshatra_id: nak.id,
      raasi: nak.raasi,
      sub_community: community.name,
      community_id: community.id,
      language_id: community.language_id,
      country: loc.country,
      state: loc.state,
      current_city: loc.city,
      current_state: loc.state,
      location: `${loc.city}, ${loc.country}`,
      profession: pick(PROFESSIONS),
      education: pick(EDUCATION),
      diet: pick(DIETS),
      manglik: pick(MANGLIK),
      height: `${int(5, 6)}'${int(0, 11)}"`,
      marital_status: "Never Married",
      religion: "Hindu",
      bio: `${SEED_MARKER} ${pick(PROFESSIONS)} based in ${loc.city}. Family roots in ${loc.state}.`,
      onboarding_status: "complete",
      membership_tier: rand() < 0.18 ? "Gold" : "Basic",
      is_admin: false,
      is_verified: rand() < 0.55,
      is_active: true,
      is_visible: true,
      founding_member: true,
    });
  }

  // Chunked so one oversized request cannot fail the whole run.
  const CHUNK = 25;
  let written = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await rest("profiles", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(rows.slice(i, i + CHUNK)),
    });
    written += Math.min(CHUNK, rows.length - i);
    process.stdout.write(`\r  seeded ${written}/${rows.length}`);
  }
  console.log();

  const male = rows.filter((r) => r.gender === "Male").length;
  const byCountry = rows.reduce((a, r) => ((a[r.country] = (a[r.country] || 0) + 1), a), {});
  console.log(`\n${written} profiles in ${DEV_PROJECT_REF}`);
  console.log(`  gender      ${male}M / ${rows.length - male}F`);
  console.log(`  countries   ${Object.entries(byCountry).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  console.log(`  gold tier   ${rows.filter((r) => r.membership_tier === "Gold").length}`);
  console.log(`  verified    ${rows.filter((r) => r.is_verified).length}`);
  console.log(`\nRemove with: node scripts/seed-dev-profiles.mjs --purge`);
}

main().catch((e) => {
  console.error("\nSeed failed:", e.message);
  process.exit(1);
});
