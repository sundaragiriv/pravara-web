/**
 * Gives the seeded dev profiles photographs.
 *
 *   npm run seed:photos            all profiles missing one
 *   npm run seed:photos -- 30      just the first 30
 *
 * Cards, match grids and profile headers all read very differently with a face
 * in them than with a placeholder glyph — crop, contrast and where the eye
 * lands are only judgeable against real portraits. This makes the dev data
 * look like the product rather than like a fixture.
 *
 * Portraits come from randomuser.me, a service that exists for exactly this,
 * and are copied into the project's own `avatars` bucket. Nothing depends on
 * that service at runtime: the images live in Supabase storage afterwards, so
 * there is no external host to allow, no CSP change, and no broken images if
 * randomuser.me disappears.
 *
 * DEV ONLY. These are stock portraits of people who are not members, and they
 * must never touch production.
 */

import { readFileSync } from "node:fs";

const DEV_PROJECT_REF = "ikzifuotttucelvugjyy";
const BUCKET = "avatars";

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
  console.error("Refusing to run: that is not the dev project. These are stock portraits, not members.");
  process.exit(1);
}

const svc = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };
const limit = Number(process.argv[2]) || 0;


const res = await fetch(
  `${URL_BASE}/rest/v1/profiles?select=id,full_name,gender&image_url=is.null&order=created_at.asc`,
  { headers: svc },
);
let profiles = await res.json();

if (!Array.isArray(profiles)) {
  console.error("Could not read profiles:", JSON.stringify(profiles).slice(0, 200));
  process.exit(1);
}
if (limit > 0) profiles = profiles.slice(0, limit);

if (profiles.length === 0) {
  console.log("Every profile already has a photo. Nothing to do.");
  process.exit(0);
}

console.log(`${profiles.length} profiles without a photo.\n`);

/**
 * One request per gender rather than one per profile — 150 individual calls is
 * rude to a free service and slow. Asks for a few more than needed so a repeat
 * portrait is unlikely within a batch.
 */
async function fetchPortraits(gender, count) {
  const wanted = Math.min(count + 5, 200);
  const res = await fetch(
    `https://randomuser.me/api/?results=${wanted}&inc=picture&gender=${gender}&noinfo`,
  );
  if (!res.ok) throw new Error(`randomuser.me returned ${res.status}`);
  const body = await res.json();
  return body.results.map((r) => r.picture.large);
}

const byGender = { female: [], male: [] };
for (const p of profiles) {
  byGender[p.gender === "Male" ? "male" : "female"].push(p);
}

let done = 0;
let failed = 0;

for (const [gender, group] of Object.entries(byGender)) {
  if (group.length === 0) continue;

  let urls;
  try {
    urls = await fetchPortraits(gender, group.length);
  } catch (error) {
    console.error(`Could not fetch ${gender} portraits: ${error.message}`);
    failed += group.length;
    continue;
  }

  for (const [index, profile] of group.entries()) {
    const source = urls[index % urls.length];
    try {
      const image = await fetch(source);
      if (!image.ok) throw new Error(`source returned ${image.status}`);
      const bytes = Buffer.from(await image.arrayBuffer());

      // Foldered by profile id, matching how real uploads are stored.
      const path = `${profile.id}/seed-portrait.jpg`;

      const upload = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${path}`, {
        method: "POST",
        headers: { ...svc, "Content-Type": "image/jpeg", "x-upsert": "true" },
        body: bytes,
      });
      if (!upload.ok) throw new Error(`upload: ${(await upload.text()).slice(0, 120)}`);

      const publicUrl = `${URL_BASE}/storage/v1/object/public/${BUCKET}/${path}`;

      const patch = await fetch(`${URL_BASE}/rest/v1/profiles?id=eq.${profile.id}`, {
        method: "PATCH",
        headers: { ...svc, "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: publicUrl }),
      });
      if (!patch.ok) throw new Error(`profile: ${(await patch.text()).slice(0, 120)}`);

      done += 1;
      process.stdout.write(".");
    } catch (error) {
      failed += 1;
      process.stdout.write("x");
      if (failed <= 3) console.error(`\n  ${profile.full_name}: ${error.message}`);
    }
  }
}

console.log(`\n\n${done} photographed${failed ? `, ${failed} failed` : ""}.`);
console.log("\nStock portraits of people who are not members. Dev only.");
