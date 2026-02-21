import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
} from "../fixtures/test-data";

test.describe("E-006 패스포트 탭 기능", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.passport);
  });

  test("패스포트 헤더 렌더링", async ({ page }) => {
    await page.goto("/passport");

    await expect(
      page.getByText(/Perspective Passport|패스포트/),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("주간/누적 통계 표시", async ({ page }) => {
    await page.goto("/passport");

    await expect(page.getByText("이번 주")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("누적 탐색")).toBeVisible();
  });

  test("뱃지 탭 기본 렌더링", async ({ page }) => {
    await page.goto("/passport");

    // Passport page generates badges internally via PassportBadge.evaluateAll()
    // The first earned badge is "관찰자" (Observer)
    await expect(
      page.getByText("관찰자"),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("발견 목록 탭 전환", async ({ page }) => {
    await page.goto("/passport");

    // Wait for page to fully render first
    await expect(page.getByText("이번 주")).toBeVisible({ timeout: 10_000 });

    // Click the exact tab button text
    const discoveryTab = page.getByRole("button", { name: "발견 목록" });
    await expect(discoveryTab).toBeVisible();
    await discoveryTab.click();

    // Content from hardcoded MOCK_PASSPORT.discoveredConcepts
    await expect(
      page.getByText("공정한 절차가 반드시 공정한 결과를 보장하지 않는다"),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("저장 페르소나 탭 전환", async ({ page }) => {
    await page.goto("/passport");

    // Wait for page to fully render first
    await expect(page.getByText("이번 주")).toBeVisible({ timeout: 10_000 });

    // Click the exact tab button text
    const personaTab = page.getByRole("button", { name: "저장 페르소나" });
    await expect(personaTab).toBeVisible();
    await personaTab.click();

    // Content from hardcoded MOCK_SAVED_PERSONAS
    await expect(
      page.getByText("현실주의 직장인"),
    ).toBeVisible({ timeout: 10_000 });
  });
});
