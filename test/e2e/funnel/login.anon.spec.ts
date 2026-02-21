import { test, expect } from "@playwright/test";

test.describe("B-003 로그인 화면 기본 동작", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("로그인 헤더 렌더링", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "PerspectiveShift" }),
    ).toBeVisible();
  });

  test("서브헤더 텍스트 표시", async ({ page }) => {
    await expect(
      page.getByText("이메일로 간편하게 로그인하세요"),
    ).toBeVisible();
  });

  test("이메일 입력 필드 표시", async ({ page }) => {
    await expect(page.getByLabel("이메일 주소")).toBeVisible();
  });

  test("로그인 링크 받기 버튼 표시", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "로그인 링크 받기" }),
    ).toBeVisible();
  });

  test("이메일 미입력 시 버튼 비활성", async ({ page }) => {
    const button = page.getByRole("button", { name: "로그인 링크 받기" });
    await expect(button).toBeDisabled();
  });

  test("유효한 이메일 입력 시 버튼 활성화", async ({ page }) => {
    await page.getByLabel("이메일 주소").fill("test@example.com");
    const button = page.getByRole("button", { name: "로그인 링크 받기" });
    await expect(button).toBeEnabled();
  });

  test("매직링크 전송 성공 시 확인 화면", async ({ page }) => {
    // Mock Supabase auth endpoint
    await page.route("**/auth/v1/magiclink**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });
    await page.route("**/auth/v1/otp**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.getByLabel("이메일 주소").fill("test@example.com");
    await page.getByRole("button", { name: "로그인 링크 받기" }).click();

    await expect(
      page.getByText("메일을 확인하세요"),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("홈으로 돌아가기 링크 존재", async ({ page }) => {
    const link = page.getByRole("link", { name: /홈으로 돌아가기/ });
    await expect(link).toBeVisible();
  });
});
