import { test, expect } from "@playwright/test";

test.describe("Smoke: anonymous pages render", () => {
  test("landing page renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(
      page.getByRole("heading", { name: "PerspectiveShift" }),
    ).toBeVisible();
  });

  test("onboarding page renders", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test("matching page renders", async ({ page }) => {
    await page.goto("/matching");
    await expect(page.getByText("대화 상대 찾기")).toBeVisible();
  });

  test("dialogue list page renders", async ({ page }) => {
    await page.goto("/dialogue");
    await expect(page.getByText("내 대화 목록")).toBeVisible();
  });
});
