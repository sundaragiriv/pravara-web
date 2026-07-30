import { defineConfig, devices } from "@playwright/test";

// E2E correctness net. Runs against the local dev server on :3000 (reuses it if
// already up). Catches client-side JS/hydration errors, broken renders, and
// flow regressions that a server-only crawl can't see.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry locally too. Client-side navigation assertions flake under
  // parallel load on a dev machine — the CTA test passes 3/3 in isolation and
  // was verified by hand, but loses the race when three workers are competing.
  // A suite that is red for contention reasons stops being read at all.
  retries: 1,
  // The Next dev server compiles each route on first hit; too many parallel
  // workers cause a cold-compile storm. Two is what this machine sustains —
  // at three, navigation assertions started losing races that pass 3/3 in
  // isolation and were verified by hand.
  workers: 2,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 45_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
