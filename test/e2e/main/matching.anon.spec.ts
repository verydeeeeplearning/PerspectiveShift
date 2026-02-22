import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  MOCK_PERSONAS,
} from "../fixtures/test-data";

test.describe("C-001 매칭 페이지 기본 상태", () => {
  test("헤더와 서브헤더 렌더링", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.matching);
    await page.goto("/matching");

    await expect(
      page.getByRole("heading", { name: "대화 상대 찾기" }),
    ).toBeVisible();
    await expect(
      page.getByText("당신과 적절한 의견 거리를 가진 상대를"),
    ).toBeVisible();
  });

  test("로딩 후 후보 콘텐츠 표시", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.matching);
    await page.goto("/matching");

    // EnergyReactiveMatchCard renders energy selector and match card
    await expect(
      page.getByText("지금 에너지 체크"),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("C-002 후보 존재 시 에너지 반응형 카드", () => {
  test("에너지 선택 후 카드 데이터 표시", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.matching);
    await page.goto("/matching");

    // Energy selector is visible
    await expect(
      page.getByRole("radiogroup", { name: "에너지 선택" }),
    ).toBeVisible({ timeout: 10_000 });

    // Match card renders topic placeholder and CTA
    await expect(page.getByText("대화를 시작하면 주제가 추천됩니다")).toBeVisible();
  });
});

test.describe("C-003 대표 후보 시작/거절", () => {
  test("대화 시작 버튼 존재", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.matching);
    await page.goto("/matching");

    // Wait for card to render
    await expect(
      page.getByText("지금 에너지 체크"),
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByRole("button", { name: /대화 시작|가볍게 5분 시작/ }),
    ).toBeVisible();
  });
});

test.describe("C-004 서브 후보 카드", () => {
  test("다른 후보 섹션 표시", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.matching);
    await page.goto("/matching");

    await expect(page.getByText("다른 후보")).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe("C-005 인간 후보 없음 + 페르소나 fallback", () => {
  test("페르소나 카드 표시", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.matchingPersonaOnly);
    await page.goto("/matching");

    await expect(
      page.getByText(MOCK_PERSONAS.personas[0].name),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("C-006 후보/페르소나 모두 없음", () => {
  test("빈 상태 메시지 표시", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.matchingEmpty);
    await page.goto("/matching");

    await expect(
      page.getByText(/현재 매칭 가능한 후보가 없습니다|지금은 매칭 상대가 없어요/),
    ).toBeVisible({ timeout: 10_000 });
  });
});
