import { test, expect } from "@playwright/test";
import { setupMockRoutes, MOCK_ROUTES } from "../fixtures/test-data";

test.describe("C-007 대화 목록 (익명)", () => {
  test("헤더 렌더링", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.dialogueList);
    await page.goto("/dialogue");

    await expect(
      page.getByRole("heading", { name: "내 대화 목록" }),
    ).toBeVisible();
  });

  test("세션 존재 시 상태 뱃지 표시", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.dialogueList);
    await page.goto("/dialogue");

    await expect(page.getByText("진행 중")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("완료")).toBeVisible();
  });

  test("세션 존재 시 상태별 뱃지 (ACTIVE/COMPLETED/EXPIRED/CANCELLED)", async ({
    page,
  }) => {
    await setupMockRoutes(page, MOCK_ROUTES.dialogueListAllStatuses);
    await page.goto("/dialogue");

    await expect(page.getByText("진행 중")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("완료")).toBeVisible();
    await expect(page.getByText("만료")).toBeVisible();
    await expect(page.getByText("취소")).toBeVisible();
  });

  test("세션 카드 클릭 시 대화 상세 이동", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.dialogueList);
    await page.goto("/dialogue");

    await expect(page.getByText("진행 중")).toBeVisible({ timeout: 10_000 });
    const firstCard = page.locator("a[href*='/dialogue/']").first();
    await expect(firstCard).toBeVisible();
  });

  test("세션 미존재 시 빈 상태 및 매칭 링크", async ({ page }) => {
    await setupMockRoutes(page, [
      {
        pattern: "**/api/dialogue/sessions",
        response: { sessions: [] },
      },
    ]);
    await page.goto("/dialogue");

    await expect(
      page.getByText(/진행 중인 대화가 없습니다|아직 대화가 없어요/),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("대화 상대 찾기")).toBeVisible();
  });
});
