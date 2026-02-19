import { test, expect } from "@playwright/test";
import { setupMockRoutes, MOCK_ROUTES, MOCK_CANDIDATES } from "../fixtures/test-data";

test.describe("Matching page (anonymous)", () => {
  test("renders heading and description", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.matching);
    await page.goto("/matching");

    await expect(
      page.getByRole("heading", { name: "대화 상대 찾기" }),
    ).toBeVisible();
    await expect(
      page.getByText("당신과 적절한 의견 거리를 가진 상대를"),
    ).toBeVisible();
  });

  test("shows loading state then candidates", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.matching);
    await page.goto("/matching");

    // Candidates should appear after loading
    await expect(
      page.getByText(MOCK_CANDIDATES.candidates[0].compatibilityNote),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("shows empty state when no candidates", async ({ page }) => {
    await setupMockRoutes(page, [
      {
        pattern: "**/api/matching/candidates",
        response: { candidates: [] },
      },
    ]);
    await page.goto("/matching");

    await expect(
      page.getByText("현재 매칭 가능한 후보가 없습니다"),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("shows secondary candidates section", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.matching);
    await page.goto("/matching");

    await expect(page.getByText("다른 후보")).toBeVisible({
      timeout: 10_000,
    });
  });
});
