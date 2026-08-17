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

import { readFileSync, readdirSync } from "node:fs";
import { spawn } from "node:child_process";

const DEV_PROJECT_REF = "ikzifuotttucelvugjyy";
const PROD_PROJECT_REF = "ybwltjpsxpimwdttwken";

const env = {};
for (const line of readFileSync(".env.development.local", "utf8").split(/\r?\n/)) {
  const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

if (!env.NEXT_PUBLIC_SUPABASE_URL?.includes(DEV_PROJECT_REF)) {
  console.error(`Refusing to start: .env.development.local does not point at ${DEV_PROJECT_REF}.`);
  process.exit(1);
}

/**
 * Loading dev credentials into the environment only redirects the SERVER.
 *
 * NEXT_PUBLIC_* values are inlined into the client bundle at build time, so a
 * build produced with .env.local ships the production Supabase URL to the
 * browser. Start that build here and the server talks to dev while every
 * request the browser makes — sign-in, profile reads, and every write — goes
 * to production. From the outside it looks like a local sandbox.
 *
 * Found by walking a production build and having login fail: the test member
 * existed in dev, and the browser was asking production about it.
 *
 * Rebuild with the dev credentials in the environment before serving:
 *
 *   node -e "…" || simply: run the build with .env.development.local values
 *   exported, e.g. via `npm run build:dev-data`
 */
function clientBundleTarget() {
  try {
    const dir = ".next/static/chunks";
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".js")) continue;
      const source = readFileSync(`${dir}/${file}`, "utf8");
      if (source.includes(PROD_PROJECT_REF)) return "prod";
      if (source.includes(DEV_PROJECT_REF)) return "dev";
    }
  } catch {
    return "unknown";
  }
  return "unknown";
}

const target = clientBundleTarget();
if (target === "prod") {
  console.error(
    [
      "",
      "Refusing to start.",
      "",
      "The client bundle in .next was built with production credentials, so the",
      "browser would talk to production while the server talks to dev. Anything",
      "you did locally would write to the live database.",
      "",
      "Rebuild with the dev environment first:",
      "",
      "  npm run build:dev-data",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(`Serving production build against ${DEV_PROJECT_REF} (dev).`);

spawn("npx", ["next", "start", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, ...env },
}).on("exit", (code) => process.exit(code ?? 0));
