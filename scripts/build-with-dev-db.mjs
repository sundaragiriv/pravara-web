/**
 * Produces a production build wired to pravara-dev.
 *
 *   npm run build:dev-data
 *
 * NEXT_PUBLIC_* values are inlined into the client bundle at build time. A
 * normal `next build` reads .env.local and therefore bakes the PRODUCTION
 * Supabase URL into the JavaScript the browser runs — which is why serving that
 * build with dev server credentials produced a split brain: the server on dev,
 * every browser request on production.
 *
 * This exports the dev values before building, so the bundle and the server
 * agree. Pair it with `npm run start:dev-data`, which now refuses to serve a
 * production-targeted bundle.
 */

import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const DEV_PROJECT_REF = "ikzifuotttucelvugjyy";

const env = {};
for (const line of readFileSync(".env.development.local", "utf8").split(/\r?\n/)) {
  const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

if (!env.NEXT_PUBLIC_SUPABASE_URL?.includes(DEV_PROJECT_REF)) {
  console.error(`Refusing to build: .env.development.local does not point at ${DEV_PROJECT_REF}.`);
  process.exit(1);
}

console.log(`Building against ${DEV_PROJECT_REF} (dev). Do not deploy this build.`);

spawn("npx", ["next", "build", "--webpack", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, ...env },
}).on("exit", (code) => process.exit(code ?? 0));
