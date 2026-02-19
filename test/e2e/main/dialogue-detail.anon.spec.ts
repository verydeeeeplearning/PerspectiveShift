import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  TEST_DIALOGUE_ID,
  MOCK_DIALOGUE_DETAIL,
} from "../fixtures/test-data";

test.describe("Dialogue detail page (anonymous)", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.dialogueDetail(TEST_DIALOGUE_ID),
    );
  });

  test("renders dialogue with turns", async ({ page }) => {
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}`);

    // Should show the existing turn content
    await expect(
      page.getByText(MOCK_DIALOGUE_DETAIL.turns[0].content),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("shows completed state with feedback and summary links", async ({
    page,
  }) => {
    // Override with completed dialogue
    await setupMockRoutes(page, [
      {
        pattern: `**/api/dialogue/sessions/${TEST_DIALOGUE_ID}`,
        response: {
          ...MOCK_DIALOGUE_DETAIL,
          status: "COMPLETED",
          currentStep: "JOINT_SUMMARY",
          isMyTurn: false,
        },
      },
    ]);

    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}`);

    await expect(
      page.getByText("대화가 완료되었습니다"),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("피드백 남기기")).toBeVisible();
    await expect(page.getByText("요약 카드 보기")).toBeVisible();
  });
});
