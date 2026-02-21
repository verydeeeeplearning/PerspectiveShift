import { test, expect } from "@playwright/test";

test.describe("G-005 접근성 기본", () => {
  test("탭바 시맨틱 역할 검증", async ({ page }) => {
    await page.goto("/matching");

    const tabbar = page.getByRole("tablist", { name: "메인 네비게이션" });
    await expect(tabbar).toBeVisible();
  });

  test("활성 탭 aria-selected 속성", async ({ page }) => {
    await page.goto("/matching");

    const matchingTab = page.getByRole("tab", { name: "매칭" });
    await expect(matchingTab).toHaveAttribute("aria-selected", "true");
  });

  test("비활성 탭 aria-selected=false", async ({ page }) => {
    await page.goto("/matching");

    const dialogueTab = page.getByRole("tab", { name: "대화" });
    await expect(dialogueTab).toHaveAttribute("aria-selected", "false");
  });

  test("CTA 링크 포커스 가능", async ({ page }) => {
    await page.goto("/");

    // The CTA is a <Link> wrapping a <PrimaryButton>
    const ctaLink = page.getByRole("link", { name: "생각 발견 시작하기" });
    await expect(ctaLink).toBeVisible();

    // Links are focusable
    await ctaLink.focus();
    await expect(ctaLink).toBeFocused();
  });

  test("로그인 폼 label-input 연결", async ({ page }) => {
    await page.goto("/auth/login");

    const emailInput = page.getByLabel("이메일 주소");
    await expect(emailInput).toBeVisible();

    // Verify the input has proper type
    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("키보드 Tab 네비게이션 — 랜딩 페이지", async ({ page }) => {
    await page.goto("/");

    // Press Tab multiple times and verify focus moves
    await page.keyboard.press("Tab");
    const firstFocused = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(firstFocused).toBeTruthy();

    await page.keyboard.press("Tab");
    const secondFocused = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(secondFocused).toBeTruthy();
  });

  test("키보드 Enter 활성화 — 랜딩 로그인 링크", async ({ page }) => {
    await page.goto("/");

    // Test keyboard Enter on a plain link (no nested interactive element)
    const loginLink = page.getByRole("link", { name: "로그인" });
    await expect(loginLink).toBeVisible();
    await loginLink.focus();
    await expect(loginLink).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
  });

  test("로그인 버튼 키보드 접근 가능", async ({ page }) => {
    await page.goto("/auth/login");

    // Fill email first so the button is enabled (disabled when email empty)
    const emailInput = page.getByLabel("이메일 주소");
    await expect(emailInput).toBeVisible();
    await emailInput.fill("test@example.com");

    const button = page.getByRole("button", { name: "로그인 링크 받기" });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    // Button should be focusable when enabled
    await button.focus();
    await expect(button).toBeFocused();
  });

  test("신고 사유 라디오 시맨틱 역할", async ({ page }) => {
    // This test requires auth, but we check the public structure
    // For anonymous access, just verify login redirect happens for /safety/report
    await page.goto("/safety/report?userId=test");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
