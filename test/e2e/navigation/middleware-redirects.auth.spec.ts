import { test, expect } from "@playwright/test";

test.describe("A-003 인증 유저 로그인 라우트 차단", () => {
  test("/auth/login → /friends 리다이렉트", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page).toHaveURL(/\/friends/);
  });

  test("/auth/login?next=/matching → /friends 리다이렉트", async ({
    page,
  }) => {
    await page.goto("/auth/login?next=/matching");
    await expect(page).toHaveURL(/\/friends/);
  });
});

test.describe("A-006 인증 유저 랜딩 자동 리다이렉트", () => {
  test("/ → /friends 자동 전환", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/friends/, { timeout: 10_000 });
  });
});
