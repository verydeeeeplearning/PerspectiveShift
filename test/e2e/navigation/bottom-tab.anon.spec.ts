import { test, expect } from "@playwright/test";

test.describe("BottomTabBar (anonymous)", () => {
  test("shows anonymous tabs: matching, dialogue, login", async ({
    page,
  }) => {
    await page.goto("/matching");

    const tabbar = page.getByRole("tablist", { name: "메인 네비게이션" });
    await expect(tabbar).toBeVisible();

    await expect(
      tabbar.getByRole("tab", { name: "매칭" }),
    ).toBeVisible();
    await expect(
      tabbar.getByRole("tab", { name: "대화" }),
    ).toBeVisible();
    await expect(
      tabbar.getByRole("tab", { name: "로그인" }),
    ).toBeVisible();
  });

  test("matching tab is active on /matching", async ({ page }) => {
    await page.goto("/matching");

    const matchingTab = page.getByRole("tab", { name: "매칭" });
    await expect(matchingTab).toHaveAttribute("aria-selected", "true");
  });

  test("navigating tabs works", async ({ page }) => {
    await page.goto("/matching");

    await page.getByRole("tab", { name: "대화" }).click();
    await expect(page).toHaveURL(/\/dialogue/);

    const dialogueTab = page.getByRole("tab", { name: "대화" });
    await expect(dialogueTab).toHaveAttribute("aria-selected", "true");
  });
});
