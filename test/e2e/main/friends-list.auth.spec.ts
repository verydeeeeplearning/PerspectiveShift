import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  MOCK_FRIENDS,
} from "../fixtures/test-data";

test.describe("Friends list page (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
  });

  test("renders heading", async ({ page }) => {
    await page.goto("/friends");

    await expect(
      page.getByRole("heading", { name: "친구 목록" }),
    ).toBeVisible();
  });

  test("shows friends when API returns data", async ({ page }) => {
    await page.goto("/friends");

    const friendUserId = MOCK_FRIENDS.friends[0].friendUserId;
    await expect(
      page.getByText(`참여자_${friendUserId}`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("대화 3회")).toBeVisible();
  });

  test("shows empty state when no friends", async ({ page }) => {
    await setupMockRoutes(page, [
      {
        pattern: "**/api/relationship/friends",
        response: { friends: [] },
      },
    ]);
    await page.goto("/friends");

    await expect(
      page.getByText("아직 친구가 없습니다"),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("shows new conversation link", async ({ page }) => {
    await page.goto("/friends");

    await expect(page.getByText("새 대화 시작")).toBeVisible({
      timeout: 10_000,
    });
  });
});
