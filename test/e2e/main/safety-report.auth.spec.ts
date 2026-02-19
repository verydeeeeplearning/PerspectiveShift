import { test, expect } from "@playwright/test";
import { setupMockRoutes, MOCK_ROUTES } from "../fixtures/test-data";

test.describe("Safety report page (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.safetyReport);
  });

  test("renders report form heading", async ({ page }) => {
    await page.goto("/safety/report?userId=some-user");

    await expect(
      page.getByRole("heading", { name: "사용자 신고" }),
    ).toBeVisible();
  });

  test("shows report reason options", async ({ page }) => {
    await page.goto("/safety/report?userId=some-user");

    await expect(page.getByText("신고 사유")).toBeVisible();
    await expect(page.getByText("괴롭힘")).toBeVisible();
    await expect(page.getByText("위협")).toBeVisible();
    await expect(page.getByText("개인정보 요구")).toBeVisible();
    await expect(page.getByText("사칭")).toBeVisible();
    await expect(page.getByText("기타")).toBeVisible();
  });

  test("shows description textarea and submit button", async ({ page }) => {
    await page.goto("/safety/report?userId=some-user");

    await expect(page.getByText("상세 설명")).toBeVisible();
    await expect(page.getByText("신고하기")).toBeVisible();
  });
});
