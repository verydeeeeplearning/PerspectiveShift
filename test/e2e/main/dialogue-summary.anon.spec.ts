import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  TEST_DIALOGUE_ID,
} from "../fixtures/test-data";

test.describe("C-012 요약 페이지", () => {
  test("요약 카드 헤더 렌더링", async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.dialogueSummary(TEST_DIALOGUE_ID),
    );
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/summary`);

    await expect(
      page.getByRole("heading", { name: "대화 요약 카드" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("새로운 대화 시작하기 링크 표시", async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.dialogueSummary(TEST_DIALOGUE_ID),
    );
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/summary`);

    await expect(
      page.getByText("새로운 대화 시작하기"),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("요약 없는 세션 접근 시 오류 표시", async ({ page }) => {
    await setupMockRoutes(page, [
      {
        pattern: `**/api/dialogue/sessions/${TEST_DIALOGUE_ID}/summary`,
        response: { error: "Not found" },
        status: 404,
      },
    ]);
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/summary`);

    // apiGet throws on non-ok status, error.message = body.error
    await expect(
      page.getByText(/Not found|요약을 찾을 수 없습니다|오류|에러/),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("API 500 에러 시 에러 메시지 표시", async ({ page }) => {
    await setupMockRoutes(page, [
      {
        pattern: `**/api/dialogue/sessions/${TEST_DIALOGUE_ID}/summary`,
        response: { error: "Internal server error" },
        status: 500,
      },
    ]);
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/summary`);

    await expect(
      page.getByText(/Internal server error|오류|에러|문제가 발생/),
    ).toBeVisible({ timeout: 10_000 });
  });
});
