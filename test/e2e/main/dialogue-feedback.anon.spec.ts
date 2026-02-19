import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  TEST_DIALOGUE_ID,
} from "../fixtures/test-data";

test.describe("Dialogue feedback page (anonymous)", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.dialogueFeedback(TEST_DIALOGUE_ID),
    );
  });

  test("renders feedback form", async ({ page }) => {
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/feedback`);

    await expect(
      page.getByRole("heading", { name: "대화 피드백" }),
    ).toBeVisible();
    await expect(page.getByText("대화 만족도")).toBeVisible();
    await expect(page.getByText("피드백 제출")).toBeVisible();
  });

  test("shows emotion question", async ({ page }) => {
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/feedback`);

    await expect(
      page.getByText("지금 기분은 어떤가요?"),
    ).toBeVisible();
  });

  test("shows re-match checkbox", async ({ page }) => {
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/feedback`);

    await expect(
      page.getByText("다른 상대와 다시 대화하고 싶습니다"),
    ).toBeVisible();
  });
});
