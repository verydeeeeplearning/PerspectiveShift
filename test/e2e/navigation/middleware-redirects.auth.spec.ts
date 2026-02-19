import { test, expect } from "@playwright/test";

test.describe("Middleware: authenticated redirects", () => {
  test("/auth/login redirects to /friends when authenticated", async ({
    page,
  }) => {
    await page.goto("/auth/login");
    await expect(page).toHaveURL(/\/friends/);
  });

  test("/friends is accessible when authenticated", async ({ page }) => {
    await page.goto("/friends");
    await expect(page).toHaveURL(/\/friends/);
  });
});
