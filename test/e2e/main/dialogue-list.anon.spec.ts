import { test, expect } from "@playwright/test";
import { setupMockRoutes, MOCK_ROUTES } from "../fixtures/test-data";

test.describe("Dialogue list page (anonymous)", () => {
  test("renders heading", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.dialogueList);
    await page.goto("/dialogue");

    await expect(
      page.getByRole("heading", { name: "내 대화 목록" }),
    ).toBeVisible();
  });

  test("shows dialogue sessions", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.dialogueList);
    await page.goto("/dialogue");

    await expect(page.getByText("진행 중")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("완료")).toBeVisible();
  });

  test("shows empty state with link to matching", async ({ page }) => {
    await setupMockRoutes(page, [
      {
        pattern: "**/api/dialogue/sessions",
        response: { sessions: [] },
      },
    ]);
    await page.goto("/dialogue");

    await expect(
      page.getByText("진행 중인 대화가 없습니다"),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("대화 상대 찾기")).toBeVisible();
  });

  test("session card links to dialogue detail", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.dialogueList);
    await page.goto("/dialogue");

    await expect(page.getByText("진행 중")).toBeVisible({ timeout: 10_000 });
    const firstCard = page.locator("a[href*='/dialogue/']").first();
    await expect(firstCard).toBeVisible();
  });
});
