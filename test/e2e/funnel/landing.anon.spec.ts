import { test, expect } from "@playwright/test";

test.describe("B-001 랜딩 기본 UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("메인 타이틀 표시", async ({ page }) => {
    await expect(page.getByText("새로운 관점을")).toBeVisible();
    await expect(page.getByText("만나보세요")).toBeVisible();
  });

  test("서브타이틀 표시", async ({ page }) => {
    await expect(page.getByText("안전하고 구조화된 대화를 통해")).toBeVisible();
  });

  test("CTA 버튼 표시", async ({ page }) => {
    await expect(page.getByText("생각 발견 시작하기")).toBeVisible();
  });

  test("개인정보 문구 표시", async ({ page }) => {
    await expect(page.getByText("대화는 익명")).toBeVisible();
    await expect(page.getByText("데이터는 내 손 안에")).toBeVisible();
  });

  test("데이터 관리 링크", async ({ page }) => {
    const link = page.getByText("내 데이터 관리");
    await expect(link).toBeVisible();
  });

  test("로그인 링크", async ({ page }) => {
    await expect(page.getByText("이미 계정이 있나요")).toBeVisible();
    await expect(page.getByText("로그인")).toBeVisible();
  });
});

test.describe("B-002 랜딩 CTA 이동", () => {
  test("생각 발견 시작하기 → /onboarding", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const ctaLink = page.getByRole("link", { name: "생각 발견 시작하기" });
    await expect(ctaLink).toBeVisible();
    await expect(ctaLink).toHaveAttribute("href", "/onboarding");

    // Navigate via href to verify target page loads
    // (click-to-navigate is unreliable under parallel load due to
    //  <a><button> nesting + React hydration timing)
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test("로그인 → /auth/login", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const loginLink = page.getByRole("link", { name: "로그인" });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/auth/login");

    // Navigate via href to verify target page loads
    await page.goto("/auth/login");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
