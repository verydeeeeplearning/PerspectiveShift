import { test, expect } from "@playwright/test";
import { MOCK_THOUGHT_MAP } from "../fixtures/test-data";

test.describe("Onboarding flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/onboarding");
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

  test("TrustMoment data management panel toggles", async ({ page }) => {
    await page.getByLabel("내 데이터 관리 열기").click();
    await expect(
      page.getByText("데이터는 언제든 삭제 요청할 수 있으며"),
    ).toBeVisible();
  });

  test("after TrustMoment, shows PrecisionSelector", async ({ page }) => {
    await page.getByText("시작하기").click();
    await expect(page.getByText("정밀도 사다리 선택")).toBeVisible();
    await expect(page.getByText("빠르게 시작")).toBeVisible();
    await expect(page.getByText("표준 분석")).toBeVisible();
    await expect(page.getByText("정밀 분석")).toBeVisible();
  });

  test("quick precision shows 5 core questions (OX + RUBRIC)", async ({
    page,
  }) => {
    // Pass TrustMoment
    await page.getByText("시작하기").click();

    // Select quick precision (5 questions)
    await page.getByText("빠르게 시작").click();

    // Q1: OX question
    await expect(
      page.getByText("AI 기술 발전에 대한 정부의 규제가"),
    ).toBeVisible();
    await page.getByRole("button", { name: "O" }).click();

    // Q2: OX question
    await expect(
      page.getByText("고소득자의 세금을 높여 복지를"),
    ).toBeVisible();
    await page.getByRole("button", { name: "X" }).click();

    // Q3: OX question
    await expect(
      page.getByText("개인의 경제적 성공은 주로 본인의"),
    ).toBeVisible();
    await page.getByRole("button", { name: "O" }).click();

    // Q4: RUBRIC question (with tooltip)
    await expect(
      page.getByText("회사가 야근을 완전히 금지해야 한다"),
    ).toBeVisible();
    await page.getByRole("button", { name: "동의" }).click();

    // Mock the calculateStance server action response before Q5
    // Intercept the POST to handle the server action
    await page.route("**/onboarding", async (route) => {
      if (route.request().method() === "POST") {
        // Return a redirect-like response that simulates navigation to result page
        await route.fulfill({
          status: 303,
          headers: {
            Location: `/onboarding/result?data=${encodeURIComponent(JSON.stringify(MOCK_THOUGHT_MAP))}`,
          },
        });
        return;
      }
      await route.continue();
    });

    // Q5: RUBRIC question
    await expect(
      page.getByText("AI가 일자리를 빼앗기보다"),
    ).toBeVisible();
  });
});
