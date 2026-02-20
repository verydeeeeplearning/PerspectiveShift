import { test, expect } from "@playwright/test";

test.describe("Login page (anonymous)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("renders login heading and email form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "PerspectiveShift" }),
    ).toBeVisible();
    await expect(page.getByLabel("이메일 주소")).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인 링크 받기" })).toBeVisible();
  });

  test("shows description text", async ({ page }) => {
    await expect(
      page.getByText("이메일로 간편하게 로그인하세요"),
    ).toBeVisible();
  });
});
