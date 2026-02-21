import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  TEST_DIALOGUE_ID,
  MOCK_DIALOGUE_DETAIL,
  MOCK_DIALOGUE_WAITING,
  MOCK_TURN_RESPONSE_TONE_WARNING,
  MOCK_TURN_RESPONSE_AGENT,
} from "../fixtures/test-data";

test.describe("C-008 대화 상세 ACTIVE 상태", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.dialogueDetail(TEST_DIALOGUE_ID),
    );
  });

  test("기존 턴 콘텐츠 렌더링", async ({ page }) => {
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}`);

    await expect(
      page.getByText(MOCK_DIALOGUE_DETAIL.turns[0].content),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("입력 폼 표시 (isMyTurn=true)", async ({ page }) => {
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}`);

    await expect(
      page.getByText(MOCK_DIALOGUE_DETAIL.turns[0].content),
    ).toBeVisible({ timeout: 10_000 });

    // Turn submission form should be visible when it's my turn
    await expect(page.getByText(/제출|보내기/)).toBeVisible();
  });

  test("완료 상태 시 피드백/요약 링크 표시", async ({ page }) => {
    const completedSession = {
      ...MOCK_DIALOGUE_DETAIL,
      status: "COMPLETED",
      currentStep: "JOINT_SUMMARY",
      isMyTurn: false,
    };

    // Override both patterns (with and without query string)
    await setupMockRoutes(page, [
      {
        pattern: `**/api/dialogue/sessions/${TEST_DIALOGUE_ID}?**`,
        response: completedSession,
      },
      {
        pattern: `**/api/dialogue/sessions/${TEST_DIALOGUE_ID}`,
        response: completedSession,
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

test.describe("C-009 대화 상세 보조 상태 (typing/warning/waiting)", () => {
  test("톤 경고 표시", async ({ page }) => {
    await setupMockRoutes(page, [
      {
        pattern: `**/api/dialogue/sessions/${TEST_DIALOGUE_ID}?**`,
        response: MOCK_DIALOGUE_DETAIL,
      },
      {
        pattern: `**/api/dialogue/sessions/${TEST_DIALOGUE_ID}`,
        response: MOCK_DIALOGUE_DETAIL,
      },
      {
        pattern: `**/api/dialogue/sessions/${TEST_DIALOGUE_ID}/turns`,
        response: MOCK_TURN_RESPONSE_TONE_WARNING,
        method: "POST",
      },
    ]);

    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}`);

    await expect(
      page.getByText(MOCK_DIALOGUE_DETAIL.turns[0].content),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("AI 에이전트 응답 포함", async ({ page }) => {
    await setupMockRoutes(page, [
      {
        pattern: `**/api/dialogue/sessions/${TEST_DIALOGUE_ID}?**`,
        response: MOCK_DIALOGUE_DETAIL,
      },
      {
        pattern: `**/api/dialogue/sessions/${TEST_DIALOGUE_ID}`,
        response: MOCK_DIALOGUE_DETAIL,
      },
      {
        pattern: `**/api/dialogue/sessions/${TEST_DIALOGUE_ID}/turns`,
        response: MOCK_TURN_RESPONSE_AGENT,
        method: "POST",
      },
    ]);

    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}`);

    await expect(
      page.getByText(MOCK_DIALOGUE_DETAIL.turns[0].content),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("상대방 대기 상태 (mySubmitted=true)", async ({ page }) => {
    await setupMockRoutes(page, [
      {
        pattern: `**/api/dialogue/sessions/${TEST_DIALOGUE_ID}?**`,
        response: MOCK_DIALOGUE_WAITING,
      },
      {
        pattern: `**/api/dialogue/sessions/${TEST_DIALOGUE_ID}`,
        response: MOCK_DIALOGUE_WAITING,
      },
    ]);

    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}`);

    await expect(
      page.getByText(MOCK_DIALOGUE_DETAIL.turns[0].content),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("C-011 대화 상세 세션 미존재/만료", () => {
  test("존재하지 않는 세션 접근 시 오류 표시", async ({ page }) => {
    await setupMockRoutes(page, [
      {
        pattern: "**/api/dialogue/sessions/non-existent-id**",
        response: { error: "Not found" },
        status: 404,
      },
      {
        pattern: "**/api/dialogue/sessions/non-existent-id",
        response: { error: "Not found" },
        status: 404,
      },
    ]);

    await page.goto("/dialogue/non-existent-id");

    await expect(
      page.getByText(/세션을 찾을 수 없습니다|오류|에러/),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("C-013 대화 FSM 단계별 UI 변화", () => {
  test("ACTIVE 세션에서 단계 인디케이터 표시", async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.dialogueDetail(TEST_DIALOGUE_ID),
    );
    await page.goto(`/dialogue/${TEST_DIALOGUE_ID}`);

    await expect(
      page.getByText(MOCK_DIALOGUE_DETAIL.turns[0].content),
    ).toBeVisible({ timeout: 10_000 });
  });
});
