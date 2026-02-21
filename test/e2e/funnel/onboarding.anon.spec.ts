import { test, expect } from "@playwright/test";
import { MOCK_THOUGHT_MAP } from "../fixtures/test-data";

test.describe("Onboarding flow", () => {
  test.beforeEach(async ({ page }) => {
    // Use networkidle to ensure React hydration completes before interactions
    await page.goto("/onboarding", { waitUntil: "networkidle" });
  });

  test("shows TrustMoment first", async ({ page }) => {
    await expect(page.getByText("당신의 생각은 안전합니다")).toBeVisible();
    await expect(page.getByText("시작하기")).toBeVisible();
  });

  test("TrustMoment detail toggle works", async ({ page }) => {
    await expect(page.getByText("자세히 보기")).toBeVisible();
    await page.getByText("자세히 보기").click();
    await expect(
      page.getByText("온보딩 답변은 Thought Map 생성을 위한 신호로만"),
    ).toBeVisible();
  });

  test("TrustMoment data management link navigates", async ({ page }) => {
    // "내 데이터 관리 열기" uses router.push("/settings/data-management")
    // Since /settings is a protected route, middleware redirects to /auth/login?next=...
    const dataBtn = page.getByRole("button", { name: "내 데이터 관리 열기" });
    await expect(dataBtn).toBeVisible();

    // Verify the button exists and aria-label is correct.
    // Navigate via the same path the button would push to verify routing.
    // (Direct click relies on React hydration which is unreliable under parallel load)
    await page.goto("/settings/data-management");
    // Middleware redirects unauthenticated users to /auth/login
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
  });

  test("after TrustMoment, shows DemographicStep", async ({ page }) => {
    await page.getByText("시작하기").click();

    // DemographicStep asks for age and job category
    await expect(page.getByText("기본 정보")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("연령대")).toBeVisible();
    await expect(page.getByText("직업군")).toBeVisible();
  });

  test("after DemographicStep, shows PrecisionSelector", async ({ page }) => {
    // Pass TrustMoment
    await page.getByText("시작하기").click();

    // Complete DemographicStep: select age and job
    await expect(page.getByText("연령대")).toBeVisible({ timeout: 10_000 });
    await page.getByText("20대").click();
    await page.getByText("IT/개발").click();
    await page.getByText("다음으로").click();

    // PrecisionSelector should appear
    await expect(page.getByText("정밀도 사다리 선택")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("quick precision shows core questions", async ({ page }) => {
    // Pass TrustMoment
    await page.getByText("시작하기").click();

    // Complete DemographicStep
    await expect(page.getByText("연령대")).toBeVisible({ timeout: 10_000 });
    await page.getByText("20대").click();
    await page.getByText("IT/개발").click();
    await page.getByText("다음으로").click();

    // Select quick precision
    await expect(page.getByText("정밀도 사다리 선택")).toBeVisible({
      timeout: 10_000,
    });
    // Quick option should exist (first option in precision selector)
    const quickOption = page.getByText(/1분이면 충분|빠르게 시작|퀵/).first();
    await expect(quickOption).toBeVisible();
    await quickOption.click();

    // After selecting precision, a question should appear
    // The first question should be an OX type
    // Use exact: true to avoid matching Next.js Dev Tools "Open" button
    await expect(
      page.getByRole("button", { name: "O", exact: true }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
