import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders main heading and CTA", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "PerspectiveShift" }),
    ).toBeVisible();
    await expect(page.getByText("생각 발견 시작하기")).toBeVisible();
    await expect(page.getByText("로그인")).toBeVisible();
  });

  test("CTA links to onboarding", async ({ page }) => {
    await page.getByText("생각 발견 시작하기").click();
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test("login link navigates to /auth/login", async ({ page }) => {
    await page.getByText("로그인").click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
