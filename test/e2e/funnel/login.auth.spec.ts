import { test, expect } from "@playwright/test";

test.describe("Login page (authenticated)", () => {
  test("redirects to /friends when already authenticated", async ({
    page,
  }) => {
    await page.goto("/auth/login");
    await expect(page).toHaveURL(/\/friends/);
  });
});
