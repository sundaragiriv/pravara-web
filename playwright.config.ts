import { defineConfig, devices } from "@playwright/test";

// E2E correctness net. Runs against the local dev server on :3000 (reuses it if
// already up). Catches client-side JS/hydration errors, broken renders, and
// flow regressions that a server-only crawl can't see.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // The Next dev server compiles each route on first hit; too many parallel
  // workers cause a cold-compile storm. Keep it modest locally.
  workers: 3,
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
