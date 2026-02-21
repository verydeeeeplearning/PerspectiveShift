import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  TEST_DIALOGUE_ID,
} from "../fixtures/test-data";

test.describe("C-010 대화 피드백", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.dialogueFeedback(TEST_DIALOGUE_ID),
    );
  });

  test("피드백 폼 헤더 렌더링", async ({ page }) => {
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/feedback`);

    await expect(
      page.getByRole("heading", { name: "대화 피드백" }),
    ).toBeVisible();
  });

  test("만족도 입력 영역 표시", async ({ page }) => {
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/feedback`);

    await expect(page.getByText("대화 만족도")).toBeVisible();
  });

  test("감정 질문 표시", async ({ page }) => {
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/feedback`);

    await expect(
      page.getByText("지금 기분은 어떤가요?"),
    ).toBeVisible();
  });

  test("재매칭 의사 체크박스 표시", async ({ page }) => {
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/feedback`);

    await expect(
      page.getByText("다른 상대와 다시 대화하고 싶습니다"),
    ).toBeVisible();
  });

  test("피드백 제출 버튼 표시", async ({ page }) => {
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}/feedback`);

    await expect(page.getByText("피드백 제출")).toBeVisible();
  });
});
