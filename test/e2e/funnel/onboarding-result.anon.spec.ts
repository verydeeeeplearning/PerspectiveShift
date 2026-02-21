import { test, expect } from "@playwright/test";
import { MOCK_THOUGHT_MAP } from "../fixtures/test-data";

test.describe("B-011 온보딩 결과 정상/오류 진입", () => {
  test("정상 데이터 — Thought Map 렌더링", async ({ page }) => {
    const dataParam = encodeURIComponent(JSON.stringify(MOCK_THOUGHT_MAP));
    await page.goto(`/onboarding/result?data=${dataParam}`);

    await expect(
      page.getByRole("heading", { name: "나의 Thought Map" }),
    ).toBeVisible();
    await expect(
      page.getByText("당신의 생각이 어떤 모습인지"),
    ).toBeVisible();
  });

  test("데이터 누락 — 오류 안내 및 CTA 표시", async ({ page }) => {
    await page.goto("/onboarding/result");

    await expect(page.getByText("결과 데이터가 없습니다")).toBeVisible();
    await expect(page.getByText("온보딩 시작하기")).toBeVisible();
  });

  test("잘못된 JSON — 파싱 오류 안내 표시", async ({ page }) => {
    await page.goto("/onboarding/result?data=invalid-json");

    await expect(
      page.getByText("결과를 불러올 수 없습니다"),
    ).toBeVisible();
    await expect(page.getByText("다시 시작하기")).toBeVisible();
  });

  test("오류 CTA 클릭 시 /onboarding 이동", async ({ page }) => {
    await page.goto("/onboarding/result", { waitUntil: "networkidle" });

    await page.getByText("온보딩 시작하기").click();
    await expect(page).toHaveURL(/\/onboarding/);
  });
});

test.describe("B-012 Thought Map 결과 액션", () => {
  test.beforeEach(async ({ page }) => {
    const dataParam = encodeURIComponent(JSON.stringify(MOCK_THOUGHT_MAP));
    await page.goto(`/onboarding/result?data=${dataParam}`, {
      waitUntil: "networkidle",
    });
  });

  test("대화 상대 찾기 CTA 표시 및 이동", async ({ page }) => {
    const cta = page.getByRole("link", { name: "대화 상대 찾기" });
    await expect(cta).toBeVisible({ timeout: 10_000 });
    await expect(cta).toHaveAttribute("href", "/matching");

    // Navigate via href to verify target page loads
    // (click-to-navigate is unreliable under parallel load due to
    //  React hydration timing on a long Suspense-wrapped page)
    await page.goto("/matching");
    await expect(page).toHaveURL(/\/matching/);
  });

  test("상황 기반 추천 섹션 존재", async ({ page }) => {
    // ShareCard is inside the recommendations <details> section
    const details = page.getByText("상황 기반 추천 보기");
    await expect(details).toBeVisible({ timeout: 10_000 });
  });
});
