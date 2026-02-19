import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  TEST_DIALOGUE_ID,
} from "../fixtures/test-data";

test.describe("Dialogue summary page (anonymous)", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.dialogueSummary(TEST_DIALOGUE_ID),
    );
  });

  test("renders summary card heading", async ({ page }) => {
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/summary`);

    await expect(
      page.getByRole("heading", { name: "대화 요약 카드" }),
    ).toBeVisible();
  });

  test("shows new conversation link", async ({ page }) => {
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/summary`);

    await expect(
      page.getByText("새로운 대화 시작하기"),
    ).toBeVisible({ timeout: 10_000 });
  });
});
