/**
 * Creates a small set of real, loggable-in accounts in DEV for hand testing.
 *
 *   npm run seed:accounts
 *
 * The 150 seeded profiles have no auth users behind them, so none of them can
 * be signed into. Walking the product by hand needs actual accounts, and it
 * needs at least two that can see each other plus a guardian, or half the
 * features have nothing to act on.
 *
 * Idempotent: run it as often as you like. It deletes and recreates its own
 * accounts and leaves everything else alone.
 *
 * Refuses to run against anything but dev.
 */

import { readFileSync } from "node:fs";

const DEV_PROJECT_REF = "ikzifuotttucelvugjyy";
const PASSWORD = "Pravara-Test-2026";

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
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL?.includes(DEV_PROJECT_REF)) {
  console.error("Refusing to run: that is not the dev project. This creates and deletes users.");
  process.exit(1);
}

const svc = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

/**
 * Ananya and Rohan are deliberately of different gothras, so they are allowed
 * to match. Meena is Ananya's mother, for guardian mode. Vikram shares Ananya's
 * gothra so the sagotra block can be seen refusing a match rather than taken on
 * trust.
 */
const ACCOUNTS = [
  {
    email: "ananya@test.pravara.ai",
    profile: {
      full_name: "Ananya Sharma", gender: "Female", age: 28, dob: "1997-06-14",
      birth_time: "07:20", birth_place: "Chennai, Tamil Nadu",
      profession: "Architect", employer: "Studio Vaastu", education: "Master's / MBA",
      location: "Austin, Texas", current_city: "Austin", current_state: "Texas", country: "USA",
      gothra: "Bharadwaja", pravara: "Angirasa - Barhaspatya - Bharadwaja",
      sub_community: "Iyer", nakshatra: "Rohini", raasi: "Vrishabha",
      diet: "Veg", height: "5'5\"", marital_status: "Never Married",
      bio: "Architect in Austin, raised in Chennai. Looking for someone who values both.",
      membership_tier: "Gold", is_visible: true,
      partner_min_age: 27, partner_max_age: 36,
    },
  },
  {
    email: "rohan@test.pravara.ai",
    profile: {
      full_name: "Rohan Iyer", gender: "Male", age: 31, dob: "1994-02-09",
      birth_time: "18:45", birth_place: "Bengaluru, Karnataka",
      profession: "Product Manager", employer: "Northwind", education: "Master's / MBA",
      location: "Austin, Texas", current_city: "Austin", current_state: "Texas", country: "USA",
      gothra: "Kashyapa", pravara: "Kashyapa - Avatsara - Naidhruva",
      sub_community: "Iyer", nakshatra: "Ashwini", raasi: "Mesha",
      diet: "Veg", height: "5'11\"", marital_status: "Never Married",
      bio: "Product manager, weekend cyclist. Family in Bengaluru.",
      membership_tier: "Gold", is_visible: true,
      partner_min_age: 25, partner_max_age: 33,
    },
  },
  {
    email: "meena@test.pravara.ai",
    profile: {
      full_name: "Meena Sharma", gender: "Female", age: 56,
      location: "Chennai, India", country: "India",
      bio: "Ananya's mother.", membership_tier: "Basic", is_visible: false,
    },
  },
  {
    email: "vikram@test.pravara.ai",
    profile: {
      full_name: "Vikram Rao", gender: "Male", age: 30, dob: "1995-11-02",
      profession: "Doctor", education: "Professional (CA/MBBS/etc)",
      location: "Dallas, Texas", current_city: "Dallas", current_state: "Texas", country: "USA",
      // Same gothra as Ananya on purpose — this is the sagotra block, visible.
      gothra: "Bharadwaja", pravara: "Angirasa - Barhaspatya - Bharadwaja",
      sub_community: "Iyer", nakshatra: "Magha", raasi: "Simha",
      diet: "Veg", height: "5'9\"", marital_status: "Never Married",
      bio: "Physician in Dallas.", membership_tier: "Basic", is_visible: true,
    },
  },
];

async function findUser(email) {
  const res = await fetch(`${URL}/auth/v1/admin/users?page=1&per_page=200`, { headers: svc });
  const body = await res.json();
  return (body.users ?? []).find((u) => u.email === email);
}

async function reset(account) {
  const existing = await findUser(account.email);
  if (existing) {
    for (const table of ["notifications", "blocks", "reports", "shortlists", "collaborators"]) {
      await fetch(`${URL}/rest/v1/${table}?user_id=eq.${existing.id}`, { method: "DELETE", headers: svc }).catch(() => {});
    }
    await fetch(`${URL}/rest/v1/connections?or=(sender_id.eq.${existing.id},receiver_id.eq.${existing.id})`, { method: "DELETE", headers: svc }).catch(() => {});
    await fetch(`${URL}/rest/v1/profiles?id=eq.${existing.id}`, { method: "DELETE", headers: svc });
    await fetch(`${URL}/auth/v1/admin/users/${existing.id}`, { method: "DELETE", headers: svc });
  }

  const created = await fetch(`${URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: svc,
    body: JSON.stringify({ email: account.email, password: PASSWORD, email_confirm: true }),
  });
  const user = await created.json();
  if (!created.ok) throw new Error(`${account.email}: ${JSON.stringify(user).slice(0, 200)}`);

  const p = await fetch(`${URL}/rest/v1/profiles`, {
    method: "POST",
    headers: { ...svc, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ id: user.id, email: account.email, ...account.profile }),
  });
  if (!p.ok) throw new Error(`${account.email} profile: ${(await p.text()).slice(0, 250)}`);

  account.id = user.id;
  return user.id;
}

for (const account of ACCOUNTS) {
  await reset(account);
  console.log(`  ${account.profile.full_name.padEnd(16)} ${account.email}`);
}

const [ananya, rohan, meena] = ACCOUNTS;

// An accepted connection, so there is a conversation to open.
await fetch(`${URL}/rest/v1/connections`, {
  method: "POST",
  headers: svc,
  body: JSON.stringify({ sender_id: rohan.id, receiver_id: ananya.id, status: "accepted" }),
});

// A pending invitation for Meena, so Kutumba has something in it.
await fetch(`${URL}/rest/v1/collaborators`, {
  method: "POST",
  headers: svc,
  body: JSON.stringify({
    user_id: ananya.id,
    collaborator_email: meena.email,
    role: "Parent",
    status: "pending",
  }),
});

console.log(`\n  Password for all four: ${PASSWORD}`);
console.log("\n  Rohan and Ananya are already connected, so Chat has a conversation.");
console.log("  Meena has a pending guardian invitation waiting in Kutumba.");
console.log("  Vikram shares Ananya's Gothra, so he is the sagotra block you can see working.");
