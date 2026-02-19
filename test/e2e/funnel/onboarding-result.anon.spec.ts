import { test, expect } from "@playwright/test";
import { MOCK_THOUGHT_MAP } from "../fixtures/test-data";

test.describe("Onboarding result page", () => {
  test("renders Thought Map with valid data", async ({ page }) => {
    const dataParam = encodeURIComponent(JSON.stringify(MOCK_THOUGHT_MAP));
    await page.goto(`/onboarding/result?data=${dataParam}`);

    await expect(
      page.getByRole("heading", { name: "나의 Thought Map" }),
    ).toBeVisible();
    await expect(
      page.getByText("당신의 생각이 어떤 모습인지"),
    ).toBeVisible();
  });

  test("shows error state when data param is missing", async ({ page }) => {
    await page.goto("/onboarding/result");
    await expect(page.getByText("결과 데이터가 없습니다")).toBeVisible();
    await expect(page.getByText("온보딩 시작하기")).toBeVisible();
  });

  test("shows error state when data param is invalid JSON", async ({
    page,
  }) => {
    await page.goto("/onboarding/result?data=invalid-json");
    await expect(
      page.getByText("결과를 불러올 수 없습니다"),
    ).toBeVisible();
    await expect(page.getByText("다시 시작하기")).toBeVisible();
  });

  test("error state link navigates back to onboarding", async ({ page }) => {
    await page.goto("/onboarding/result");
    await page.getByText("온보딩 시작하기").click();
    await expect(page).toHaveURL(/\/onboarding/);
  });
});
