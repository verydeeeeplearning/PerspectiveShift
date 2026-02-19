import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  TEST_FRIENDSHIP_ID,
  TEST_FRIEND_USER_ID,
} from "../fixtures/test-data";

test.describe("Friend detail page (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.friendDetail(TEST_FRIENDSHIP_ID),
    );
  });

  test("renders friend heading", async ({ page }) => {
    await page.goto(`/friends/${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByText(`참여자_${TEST_FRIEND_USER_ID}`),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("shows disclosure level section", async ({ page }) => {
    await page.goto(`/friends/${TEST_FRIENDSHIP_ID}`);

    await expect(page.getByText("공개 레벨")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("shows action buttons", async ({ page }) => {
    await page.goto(`/friends/${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByText("오프라인 만남 제안하기"),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("친구 해제")).toBeVisible();
    await expect(page.getByText("신고하기")).toBeVisible();
  });
});
