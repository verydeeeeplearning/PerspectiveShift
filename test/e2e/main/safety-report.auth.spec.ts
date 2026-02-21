import { test, expect } from "@playwright/test";
import { setupMockRoutes, MOCK_ROUTES } from "../fixtures/test-data";

test.describe("D-010 신고하기 플로우", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.safetyReport);
  });

  test("신고 폼 헤더 렌더링", async ({ page }) => {
    await page.goto("/safety/report?userId=some-user");

    await expect(
      page.getByRole("heading", { name: "사용자 신고" }),
    ).toBeVisible();
  });

  test("신고 사유 5개 옵션 표시", async ({ page }) => {
    await page.goto("/safety/report?userId=some-user");

    await expect(page.getByText("신고 사유")).toBeVisible();
    await expect(page.getByText("괴롭힘")).toBeVisible();
    await expect(page.getByText("위협")).toBeVisible();
    await expect(page.getByText("개인정보 요구")).toBeVisible();
    await expect(page.getByText("사칭")).toBeVisible();
    await expect(page.getByText("기타")).toBeVisible();
  });

  test("상세 설명 입력란 및 제출 버튼 표시", async ({ page }) => {
    await page.goto("/safety/report?userId=some-user");

    await expect(page.getByText("상세 설명")).toBeVisible();
    await expect(page.getByText("신고하기")).toBeVisible();
  });

  test("userId 없이 접속 시 오류 메시지", async ({ page }) => {
    await page.goto("/safety/report");

    await expect(
      page.getByText(/신고 대상이 지정되지 않았습니다|오류|에러/),
    ).toBeVisible({ timeout: 10_000 });
  });
});
