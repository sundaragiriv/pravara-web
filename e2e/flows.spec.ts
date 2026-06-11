import { test, expect } from "@playwright/test";

// Critical interaction flows. These deliberately do NOT submit to the database
// (no test rows / emails created) — they exercise navigation + client validation.

test("home → register CTA navigates to the lead form", async ({ page }) => {
  await page.goto("/");
  await page.locator('a[href="/register"]').first().click();
  await expect(page).toHaveURL(/\/register/);
  await expect(page.getByRole("button", { name: /founder circle/i })).toBeVisible();
});

test("signup rejects mismatched passwords without submitting", async ({ page }) => {
  await page.goto("/signup");
  await page.getByPlaceholder("Your full name").fill("Test Founder");
  await page.getByPlaceholder("name@example.com").fill("noone@example.com");
  await page.getByPlaceholder("At least 8 characters").fill("password123");
  await page.getByPlaceholder("Re-enter your password").fill("different123");
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  // Still on signup — nothing was submitted.
  await expect(page).toHaveURL(/\/signup/);
});

test("signup enforces minimum password length", async ({ page }) => {
  await page.goto("/signup");
  await page.getByPlaceholder("Your full name").fill("Test Founder");
  await page.getByPlaceholder("name@example.com").fill("noone@example.com");
  await page.getByPlaceholder("At least 8 characters").fill("short");
  await page.getByPlaceholder("Re-enter your password").fill("short");
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
});

test("login → forgot-password view toggles", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /forgot password/i }).click();
  await expect(page.getByRole("heading", { name: /reset password/i })).toBeVisible();
});

test("register lead form shows the founding-circle progress", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByText(/founder circle/i).first()).toBeVisible();
  await expect(page.getByText(/reserve your founding seat/i)).toBeVisible();
});
