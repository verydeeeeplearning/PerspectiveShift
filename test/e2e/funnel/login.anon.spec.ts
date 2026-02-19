import { test, expect } from "@playwright/test";

test.describe("Login page (anonymous)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("renders login heading and Google button", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "PerspectiveShift" }),
    ).toBeVisible();
    await expect(page.getByText("Google로 계속하기")).toBeVisible();
  });

  test("shows description text", async ({ page }) => {
    await expect(
      page.getByText("로그인하여 관계를 확장하세요"),
    ).toBeVisible();
  });
});
