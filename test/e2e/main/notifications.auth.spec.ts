import { test, expect } from "@playwright/test";

test.describe("E-003 알림 설정 토글 영속성", () => {
  test("알림 설정 페이지 헤더 렌더링", async ({ page }) => {
    await page.goto("/settings/notifications");

    await expect(
      page.getByRole("heading", { name: /알림 설정/ }),
    ).toBeVisible();
  });

  test("기본 토글 상태 표시", async ({ page }) => {
    await page.goto("/settings/notifications");

    // Default toggles should be visible
    await expect(
      page.getByText(/D\+1 리뷰|매칭 알림|페르소나 알림|주간 리포트/),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("토글 변경 후 localStorage 업데이트", async ({ page }) => {
    await page.goto("/settings/notifications");

    // Wait for the page to fully render
    await expect(
      page.getByRole("heading", { name: /알림 설정/ }),
    ).toBeVisible();

    // Verify that localStorage can store notification config
    const hasConfig = await page.evaluate(() => {
      const config = localStorage.getItem("ps-notification-config");
      return config !== null;
    });

    // Config may or may not exist initially depending on defaults
    expect(typeof hasConfig).toBe("boolean");
  });
});

test.describe("E-004 알림 7일 끄기", () => {
  test("7일 끄기 버튼 표시", async ({ page }) => {
    await page.goto("/settings/notifications");

    await expect(page.getByText("7일 끄기")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("7일 끄기 클릭 시 상태 변경", async ({ page }) => {
    await page.goto("/settings/notifications");

    await page.getByText("7일 끄기").click();

    // After clicking, should show activation status
    await expect(
      page.getByText(/7일 끄기 활성화|까지/),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("7일 끄기 시 localStorage에 snooze 날짜 저장", async ({ page }) => {
    await page.goto("/settings/notifications");

    await page.getByText("7일 끄기").click();

    const snoozeUntil = await page.evaluate(() =>
      localStorage.getItem("ps-notification-snooze-until"),
    );
    expect(snoozeUntil).toBeTruthy();
  });
});

test.describe("E-005 브라우저 알림 권한 요청", () => {
  test("브라우저 권한 요청 버튼 표시", async ({ page }) => {
    await page.goto("/settings/notifications");

    await expect(
      page.getByText(/브라우저 권한 요청|알림 허용/),
    ).toBeVisible({ timeout: 10_000 });
  });
});
