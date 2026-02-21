import { test, expect } from "@playwright/test";
import { setupMockRoutes, MOCK_ROUTES } from "../fixtures/test-data";

test.describe("A-005 인증 하단 탭 검증", () => {
  test("탭바에 매칭, 대화, 친구, 더보기 4개 탭 표시", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends");

    const tabbar = page.getByRole("tablist", { name: "메인 네비게이션" });
    await expect(tabbar).toBeVisible();

    await expect(tabbar.getByRole("tab", { name: "매칭" })).toBeVisible();
    await expect(tabbar.getByRole("tab", { name: "대화" })).toBeVisible();
    await expect(tabbar.getByRole("tab", { name: "친구" })).toBeVisible();
    await expect(tabbar.getByRole("tab", { name: "더보기" })).toBeVisible();
  });

  test("로그인 탭이 표시되지 않음", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends");

    const tabbar = page.getByRole("tablist", { name: "메인 네비게이션" });
    await expect(
      tabbar.getByRole("tab", { name: "로그인" }),
    ).not.toBeVisible();
  });

  test("친구 탭이 /friends에서 활성 상태", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends");

    const friendsTab = page.getByRole("tab", { name: "친구" });
    await expect(friendsTab).toHaveAttribute("aria-selected", "true");
  });

  test("매칭 탭 클릭 시 /matching 이동", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends", { waitUntil: "networkidle" });

    await expect(async () => {
      await page.getByRole("tab", { name: "매칭" }).click({ force: true, timeout: 2_000 });
      await expect(page).toHaveURL(/\/matching/, { timeout: 3_000 });
    }).toPass({ timeout: 15_000 });
  });

  test("대화 탭 클릭 시 /dialogue 이동", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends", { waitUntil: "networkidle" });

    await expect(async () => {
      await page.getByRole("tab", { name: "대화" }).click({ force: true, timeout: 2_000 });
      await expect(page).toHaveURL(/\/dialogue/, { timeout: 3_000 });
    }).toPass({ timeout: 15_000 });
  });

  test("더보기 탭 클릭 시 /settings 이동", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends", { waitUntil: "networkidle" });

    await expect(async () => {
      await page.getByRole("tab", { name: "더보기" }).click({ force: true, timeout: 2_000 });
      await expect(page).toHaveURL(/\/settings/, { timeout: 3_000 });
    }).toPass({ timeout: 15_000 });
  });
});
