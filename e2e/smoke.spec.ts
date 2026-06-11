import { test, expect, type Page } from "@playwright/test";

// Every public-facing route. Member routes (/dashboard, /admin, /settings,
// /onboarding) redirect to /login when signed out — covered by auth.spec.ts.
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/faq",
  "/membership",
  "/support",
  "/login",
  "/signup",
  "/register",
  "/legal/privacy",
  "/legal/terms",
  "/legal/trust",
  "/kutumba",
  "/auth/reset-password",
  "/vouch/00000000-0000-0000-0000-000000000000",
  "/profile/00000000-0000-0000-0000-000000000000",
];

// Console noise that isn't a real bug (network blips for 3rd-party/optional services).
const BENIGN = [
  /favicon/i,
  /Failed to load resource/i,
  /net::ERR/i,
  /upstash|redis/i,
  /Download the React DevTools/i,
];

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !BENIGN.some((re) => re.test(msg.text()))) {
      errors.push(`console: ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

for (const route of PUBLIC_ROUTES) {
  test(`renders cleanly: ${route}`, async ({ page }) => {
    const errors = watchErrors(page);

    const resp = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(resp, `no response for ${route}`).toBeTruthy();
    expect(resp!.status(), `bad status for ${route}`).toBeLessThan(400);

    // Settle: wait until the page has rendered text OR a client-gated page has
    // bounced a signed-out visitor to /login (the getUser round-trip can be slow).
    await page
      .waitForFunction(
        () => document.body.innerText.trim().length > 0 || location.pathname === "/login",
        null,
        { timeout: 9000 },
      )
      .catch(() => {});
    await page.waitForTimeout(300);

    // No Next.js dev error overlay. (The <nextjs-portal> element is mounted on
    // every page in dev; only an actual error renders these headings inside it.)
    await expect(
      page.getByText(/Unhandled Runtime Error|Build Error|Console Error|Application error/i),
    ).toHaveCount(0);

    // Page rendered content — or validly bounced a signed-out visitor to /login
    // (some member pages, e.g. /membership, /kutumba, are client-gated).
    const bodyText = (await page.locator("body").innerText()).trim();
    const redirectedToLogin = new URL(page.url()).pathname === "/login";
    expect(
      bodyText.length > 0 || redirectedToLogin,
      `empty body on ${route}`,
    ).toBeTruthy();

    expect(errors, `JS errors on ${route}:\n${errors.join("\n")}`).toEqual([]);
  });
}
