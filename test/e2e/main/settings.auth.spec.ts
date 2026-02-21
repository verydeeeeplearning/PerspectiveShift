import { test, expect } from "@playwright/test";
import { setupMockRoutes, MOCK_ROUTES } from "../fixtures/test-data";

test.describe("E-001 설정 메인", () => {
  test("더보기 헤더 렌더링", async ({ page }) => {
    await page.goto("/settings");

    await expect(
      page.getByRole("heading", { name: /더보기|설정/ }),
    ).toBeVisible();
  });

  test("내 데이터 관리 링크 표시", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByText("내 데이터 관리")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("알림 설정 링크 표시", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByText("알림 설정")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("로그아웃 버튼 표시", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByText("로그아웃")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("내 데이터 관리 클릭 시 /settings/data-management 이동", async ({
    page,
  }) => {
    await page.goto("/settings");

    await page.getByText("내 데이터 관리").click();
    await expect(page).toHaveURL(/\/settings\/data-management/);
  });

  test("알림 설정 클릭 시 /settings/notifications 이동", async ({
    page,
  }) => {
    await page.goto("/settings");

    await page.getByText("알림 설정").click();
    await expect(page).toHaveURL(/\/settings\/notifications/);
  });
});

test.describe("E-002 데이터 관리 페이지", () => {
  test("데이터 관리 헤더 렌더링", async ({ page }) => {
    await page.goto("/settings/data-management");

    await expect(
      page.getByRole("heading", { name: /데이터 관리/ }),
    ).toBeVisible();
  });

  test("저장 데이터 항목 표시", async ({ page }) => {
    await page.goto("/settings/data-management");

    await expect(page.getByText("닉네임")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("입장 프로필")).toBeVisible();
    await expect(page.getByText("대화 기록")).toBeVisible();
  });

  test("데이터 내보내기 버튼 존재", async ({ page }) => {
    await page.goto("/settings/data-management");

    await expect(
      page.getByRole("button", { name: "데이터 내보내기" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("데이터 삭제 요청 버튼 존재", async ({ page }) => {
    await page.goto("/settings/data-management");

    await expect(page.getByText("데이터 삭제 요청")).toBeVisible({
      timeout: 10_000,
    });
  });
});
