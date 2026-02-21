import { test, expect } from "@playwright/test";
import { setupMockRoutes, MOCK_ROUTES } from "../fixtures/test-data";

test.describe("A-004 익명 하단 탭 검증", () => {
  test.beforeEach(async ({ page }) => {
    // Set up matching mocks to ensure the page loads fully
    await setupMockRoutes(page, MOCK_ROUTES.matching);
  });

  test("탭바에 매칭, 대화, 로그인 3개 탭 표시", async ({ page }) => {
    await page.goto("/matching");

    const tabbar = page.getByRole("tablist", { name: "메인 네비게이션" });
    await expect(tabbar).toBeVisible();

    await expect(tabbar.getByRole("tab", { name: "매칭" })).toBeVisible();
    await expect(tabbar.getByRole("tab", { name: "대화" })).toBeVisible();
    await expect(tabbar.getByRole("tab", { name: "로그인" })).toBeVisible();
  });

  test("매칭 탭이 /matching에서 활성 상태", async ({ page }) => {
    await page.goto("/matching");

    const matchingTab = page.getByRole("tab", { name: "매칭" });
    await expect(matchingTab).toHaveAttribute("aria-selected", "true");
  });

  test("대화 탭 클릭 시 /dialogue 이동", async ({ page }) => {
    await page.goto("/matching");

    // Wait for page to be interactive
    await expect(
      page.getByRole("tab", { name: "매칭" }),
    ).toHaveAttribute("aria-selected", "true");

    await page.getByRole("tab", { name: "대화" }).click();
    await expect(page).toHaveURL(/\/dialogue/, { timeout: 10_000 });
  });

  test("로그인 탭 클릭 시 /auth/login 이동", async ({ page }) => {
    await page.goto("/matching", { waitUntil: "networkidle" });

    // Wait for page to be interactive
    await expect(
      page.getByRole("tab", { name: "매칭" }),
    ).toHaveAttribute("aria-selected", "true");

    await page.getByRole("tab", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
  });

  test("친구 탭이 표시되지 않음", async ({ page }) => {
    await page.goto("/matching");

    const tabbar = page.getByRole("tablist", { name: "메인 네비게이션" });
    await expect(
      tabbar.getByRole("tab", { name: "친구" }),
    ).not.toBeVisible();
  });

  test("더보기 탭이 표시되지 않음", async ({ page }) => {
    await page.goto("/matching");

    const tabbar = page.getByRole("tablist", { name: "메인 네비게이션" });
    await expect(
      tabbar.getByRole("tab", { name: "더보기" }),
    ).not.toBeVisible();
  });
});
