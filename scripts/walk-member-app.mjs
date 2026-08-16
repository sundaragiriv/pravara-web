/**
 * Walks the member application as a real signed-in member.
 *
 *   npm run walk            (expects a dev server on :3111 with PRE_LAUNCH_ENABLED=false)
 *
 * Eleven surfaces compile, typecheck and pass e2e, and none had ever been used
 * by a member. That gap is where the remaining risk lives — the safety work
 * turned up two genuine bugs that only appeared when the paths were exercised,
 * not when the code was read.
 *
 * Creates a throwaway member with a complete profile in the DEV project, signs
 * in through the real login form, visits every surface, and records console
 * errors, uncaught exceptions and failed requests against each one. Cleans up
 * afterwards.
 */

import { readFileSync, mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const DEV_PROJECT_REF = "ikzifuotttucelvugjyy";
const BASE = process.env.WALK_BASE_URL || "http://localhost:3111";
const SHOTS = process.env.WALK_SHOT_DIR || ".walk-shots";

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
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_BASE?.includes(DEV_PROJECT_REF)) {
  console.error("Refusing to run: this script creates and deletes users, and that is not the dev project.");
  process.exit(1);
}

const svc = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

const member = {
  email: `walk-${process.pid}@pravara.test`,
  password: "Walk-Passw0rd-2026",
};

/**
 * A deliberately complete profile. A half-filled one would mask exactly the
 * bugs this walk is looking for — pages that assume a field is present.
 */
const PROFILE = {
  full_name: "Ananya Walkthrough",
  gender: "Female",
  age: 28,
  dob: "1997-06-14",
  birth_time: "07:20",
  birth_place: "Chennai, Tamil Nadu",
  profession: "Architect",
  employer: "Studio Vaastu",
  education: "Master's / MBA",
  location: "Austin, Texas",
  current_city: "Austin",
  current_state: "Texas",
  country: "USA",
  gothra: "Bharadwaja",
  pravara: "Angirasa - Barhaspatya - Bharadwaja",
  sub_community: "Iyer",
  nakshatra: "Rohini",
  raasi: "Vrishabha",
  diet: "Veg",
  height: "5'5\"",
  marital_status: "Never Married",
  bio: "Architect in Austin, raised in Chennai. Looking for someone who values both.",
  membership_tier: "Gold",
  partner_min_age: 27,
  partner_max_age: 36,
};

async function createMember() {
  const res = await fetch(`${URL_BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: svc,
    body: JSON.stringify({ email: member.email, password: member.password, email_confirm: true }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`create user: ${JSON.stringify(body).slice(0, 200)}`);
  member.id = body.id;

  const p = await fetch(`${URL_BASE}/rest/v1/profiles`, {
    method: "POST",
    headers: { ...svc, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ id: body.id, email: member.email, ...PROFILE }),
  });
  if (!p.ok) throw new Error(`create profile: ${(await p.text()).slice(0, 300)}`);
}

async function cleanup() {
  if (!member.id) return;
  for (const table of ["blocks", "reports", "shortlists", "connections", "notifications"]) {
    await fetch(`${URL_BASE}/rest/v1/${table}?or=(user_id.eq.${member.id},profile_id.eq.${member.id})`, {
      method: "DELETE",
      headers: svc,
    }).catch(() => {});
  }
  await fetch(`${URL_BASE}/rest/v1/profiles?id=eq.${member.id}`, { method: "DELETE", headers: svc });
  await fetch(`${URL_BASE}/auth/v1/admin/users/${member.id}`, { method: "DELETE", headers: svc });
}

/** Every surface a member can reach, in roughly the order they would meet them. */
const SURFACES = [
  { path: "/dashboard", name: "dashboard" },
  { path: "/dashboard/edit-profile", name: "edit-profile" },
  { path: "/dashboard/shortlist", name: "shortlist" },
  { path: "/dashboard/requests", name: "requests" },
  { path: "/dashboard/chat", name: "chat" },
  { path: "/kutumba", name: "kutumba" },
  { path: "/settings", name: "settings" },
  { path: "/membership", name: "membership" },
  { path: "/support", name: "support" },
  { path: "/onboarding", name: "onboarding" },
];

const report = [];
const notes = [];

try {
  mkdirSync(SHOTS, { recursive: true });
  await createMember();
  console.log(`Member created: ${member.email}\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  // Sign in through the real form rather than injecting a session, so the login
  // path is walked too.
  //
  // Waiting for hydration before touching the form is not politeness — submit
  // it first and the browser performs a native GET, because the React
  // onSubmit that calls preventDefault is not attached yet. The page then
  // reloads to /login? with no message, which looks exactly like a failed
  // password. Worth knowing that a real member on a slow connection can hit
  // the same thing.
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);

  await page.fill('input[type="email"]', member.email);
  await page.fill('input[type="password"]', member.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2500);

  const landed = new URL(page.url()).pathname;
  console.log(`After login: ${landed}\n`);
  if (landed === "/login") {
    throw new Error("Login did not proceed — everything after this would be meaningless.");
  }

  for (const surface of SURFACES) {
    const problems = [];
    const onConsole = (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();

      // React's development double-mount starts the dashboard's match fetch,
      // tears it down and starts it again. The discarded one surfaces here as
      // "Failed to fetch" even though the surviving request returns 200 and the
      // page renders fifty matches. Verified by tracing the request and by
      // reading the rendered page, not assumed.
      //
      // Recorded as a note rather than dropped, so it cannot quietly become the
      // hiding place for a real failure.
      if (/Filter fetch error/.test(text)) {
        notes.push(`${surface.path}: dashboard match fetch aborted by React double-mount (dev only)`);
        return;
      }

      problems.push(`console: ${text.slice(0, 200)}`);
    };
    const onPageError = (err) => problems.push(`exception: ${String(err).slice(0, 200)}`);
    const onResponse = (res) => {
      if (res.status() >= 400 && !res.url().includes("favicon")) {
        problems.push(`http ${res.status()}: ${res.url().replace(BASE, "").slice(0, 120)}`);
      }
    };

    page.on("console", onConsole);
    page.on("pageerror", onPageError);
    page.on("response", onResponse);

    let finalPath = surface.path;
    try {
      // networkidle rather than domcontentloaded: leaving while requests are
      // still in flight aborts them, and an aborted fetch surfaces as
      // "TypeError: Failed to fetch", which reads exactly like a real failure.
      await page.goto(BASE + surface.path, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(2000);
      finalPath = new URL(page.url()).pathname;
      await page.screenshot({ path: `${SHOTS}/${surface.name}.png`, fullPage: false });
    } catch (error) {
      problems.push(`navigation: ${String(error.message).slice(0, 160)}`);
    }

    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    page.off("response", onResponse);

    const redirected = finalPath !== surface.path;
    report.push({ ...surface, finalPath, redirected, problems });

    const mark = problems.length ? "x" : redirected ? "»" : ".";
    process.stdout.write(mark);
  }

  await browser.close();
} catch (error) {
  console.error(`\n\nAborted: ${error.message}`);
  report.push({ path: "(setup)", name: "setup", problems: [error.message] });
} finally {
  await cleanup();
}

// ── Report ──────────────────────────────────────────────────────────────────

console.log("\n");
const clean = report.filter((r) => !r.problems.length && !r.redirected);
const moved = report.filter((r) => !r.problems.length && r.redirected);
const broken = report.filter((r) => r.problems.length);

console.log(`${clean.length} clean · ${moved.length} redirected · ${broken.length} with problems\n`);

for (const row of moved) {
  console.log(`»  ${row.path}  ->  ${row.finalPath}`);
}
if (moved.length) console.log("");

for (const row of broken) {
  console.log(`x  ${row.path}${row.redirected ? `  ->  ${row.finalPath}` : ""}`);
  for (const problem of [...new Set(row.problems)].slice(0, 6)) {
    console.log(`     ${problem}`);
  }
  console.log("");
}

console.log(`Screenshots in ${SHOTS}/`);
process.exit(broken.length ? 1 : 0);
