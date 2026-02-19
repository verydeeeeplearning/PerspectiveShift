import { test, expect } from "@playwright/test";

test.describe("Middleware: unauthenticated redirects", () => {
  const protectedRoutes = [
    "/friends",
    "/friends/some-id",
    "/chat/some-friendship-id",
    "/offline/some-id",
    "/safety/report",
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects to /auth/login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/auth\/login/);
      // Should preserve the original path as ?next= param
      const url = new URL(page.url());
      expect(url.searchParams.get("next")).toBe(route);
    });
  }

  const publicRoutes = ["/", "/onboarding", "/matching", "/dialogue"];

  for (const route of publicRoutes) {
    test(`${route} does NOT redirect (public)`, async ({ page }) => {
      await page.goto(route);
      await expect(page).not.toHaveURL(/\/auth\/login/);
    });
  }
});
