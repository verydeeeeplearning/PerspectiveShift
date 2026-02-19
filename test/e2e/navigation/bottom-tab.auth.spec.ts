import { test, expect } from "@playwright/test";
import { setupMockRoutes, MOCK_ROUTES } from "../fixtures/test-data";

test.describe("BottomTabBar (authenticated)", () => {
  test("shows authenticated tabs: matching, dialogue, friends, more", async ({
    page,
  }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends");

    const tabbar = page.getByRole("tablist", { name: "메인 네비게이션" });
    await expect(tabbar).toBeVisible();

    await expect(
      tabbar.getByRole("tab", { name: "매칭" }),
    ).toBeVisible();
    await expect(
      tabbar.getByRole("tab", { name: "대화" }),
    ).toBeVisible();
    await expect(
      tabbar.getByRole("tab", { name: "친구" }),
    ).toBeVisible();
    await expect(
      tabbar.getByRole("tab", { name: "더보기" }),
    ).toBeVisible();
  });

  test("friends tab is active on /friends", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends");

    const friendsTab = page.getByRole("tab", { name: "친구" });
    await expect(friendsTab).toHaveAttribute("aria-selected", "true");
  });

  test("does NOT show login tab when authenticated", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends");

    const tabbar = page.getByRole("tablist", { name: "메인 네비게이션" });
    await expect(
      tabbar.getByRole("tab", { name: "로그인" }),
    ).not.toBeVisible();
  });
});
