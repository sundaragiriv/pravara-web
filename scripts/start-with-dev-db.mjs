/**
 * Serves a production build against pravara-dev.
 *
 * `next start` runs in production mode and therefore ignores
 * .env.development.local, silently falling through to the production Supabase
 * in .env.local. That fails logins with correct credentials, and worse, writes
 * real rows to the live database from what looks like a local sandbox.
 *
 * This loads the dev credentials into the environment first, so a locally
 * served production build behaves like local development.
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
  console.error(`Refusing to start: .env.development.local does not point at ${DEV_PROJECT_REF}.`);
  process.exit(1);
}

console.log(`Serving production build against ${DEV_PROJECT_REF} (dev).`);

spawn("npx", ["next", "start", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, ...env },
}).on("exit", (code) => process.exit(code ?? 0));
