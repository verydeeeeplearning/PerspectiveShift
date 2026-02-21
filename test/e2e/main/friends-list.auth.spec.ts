import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
} from "../fixtures/test-data";

// Component truncates userId: .slice(0, 4).toUpperCase()
// friendUserId "e2e-user-002" → "E2E-" → displayed as "참여자_E2E-"
const DISPLAY_NAME = "참여자_E2E-";

test.describe("D-001 친구 목록 기본/빈 상태", () => {
  test("헤더 렌더링", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends");

    await expect(
      page.getByRole("heading", { name: "친구 목록" }),
    ).toBeVisible();
  });

  test("친구 존재 시 별칭과 대화 횟수 표시", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends");

    await expect(
      page.getByText(DISPLAY_NAME),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("대화 3회")).toBeVisible();
  });

  test("새 대화 시작 링크 표시", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends");

    await expect(page.getByText("새 대화 시작")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("친구 없을 때 빈 상태 표시", async ({ page }) => {
    await setupMockRoutes(page, [
      {
        pattern: "**/api/relationship/friends",
        response: { friends: [] },
      },
    ]);
    await page.goto("/friends");

    await expect(
      page.getByText("아직 친구가 없습니다"),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("친구 카드 클릭 시 상세 페이지 이동 가능", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends");

    await expect(
      page.getByText(DISPLAY_NAME),
    ).toBeVisible({ timeout: 10_000 });

    const friendCard = page.locator("a[href*='/friends/']").first();
    await expect(friendCard).toBeVisible();
  });
});
