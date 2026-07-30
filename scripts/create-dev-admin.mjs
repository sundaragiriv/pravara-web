/**
 * Creates (or resets) an admin account in pravara-dev.
 *
 * Refuses to run against anything but the dev project. Creating an account with
 * a known password in production would be a standing security hole.
 *
 *   node scripts/create-dev-admin.mjs <email> <password>
 */

import { readFileSync } from "node:fs";

const DEV_PROJECT_REF = "ikzifuotttucelvugjyy";

function readEnv(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
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

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: node scripts/create-dev-admin.mjs <email> <password>");
  process.exit(1);
}

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function call(path, init = {}) {
  const res = await fetch(`${URL_}${path}`, { ...init, headers: { ...H, ...init.headers } });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${JSON.stringify(body)}`);
  return body;
}

// Reuse the account if it already exists so the script is safe to re-run —
// otherwise a second run fails on the unique email and leaves you guessing
// which password is live.
const existing = await call(`/auth/v1/admin/users?page=1&per_page=200`);
const found = (existing.users || []).find((u) => u.email?.toLowerCase() === email.toLowerCase());

let userId;
if (found) {
  userId = found.id;
  await call(`/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ password, email_confirm: true }),
  });
  console.log("Existing auth user — password reset.");
} else {
  const created = await call(`/auth/v1/admin/users`, {
    method: "POST",
    // email_confirm skips the verification mail; there is no inbox in dev.
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  userId = created.id;
  console.log("Auth user created.");
}

// Upsert the profile. is_admin is set explicitly as well as relying on
// ADMIN_EMAILS, so the account still works if that env var ever changes.
await call(`/rest/v1/profiles?on_conflict=id`, {
  method: "POST",
  headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify({
    id: userId,
    email,
    full_name: "Venkata R Sundaragiri",
    membership_tier: "Concierge",
    onboarding_status: "complete",
    country: "United States",
    location: "United States",
    is_admin: true,
    is_verified: true,
    is_active: true,
    is_visible: false, // an admin account should not appear in members' match results
    founding_member: true,
  }),
});

console.log(`Profile upserted (is_admin, Concierge, hidden from matching).`);
console.log(`\n  email    ${email}`);
console.log(`  user id  ${userId}`);
console.log(`  project  ${DEV_PROJECT_REF} (dev only)`);
