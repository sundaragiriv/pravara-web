import { test, expect } from "@playwright/test";

// Member-only routes must redirect a signed-out visitor to /login (server-side).
// /admin additionally enforces an admin role for signed-in non-admins.
const GATED_ROUTES = [
  "/dashboard",
  "/dashboard/shortlist",
  "/dashboard/requests",
  "/dashboard/chat",
  "/dashboard/edit-profile",
  "/onboarding",
  "/settings",
  "/admin",
  "/admin/cohort",
];

for (const route of GATED_ROUTES) {
  test(`signed-out ${route} → /login`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
  });
}
