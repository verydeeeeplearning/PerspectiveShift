import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  TEST_PROPOSAL_ID,
  TEST_FRIENDSHIP_ID,
} from "../fixtures/test-data";

test.describe("D-008 오프라인 제안 생성", () => {
  test("제안 폼 헤더 렌더링", async ({ page }) => {
    await page.goto(`/offline?friendshipId=${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByRole("heading", { name: "오프라인 만남 제안" }),
    ).toBeVisible();
  });

  test("제안 폼 필드 표시 (날짜, 장소, 제출 버튼)", async ({ page }) => {
    await page.goto(`/offline?friendshipId=${TEST_FRIENDSHIP_ID}`);

    await expect(page.getByText("제안 일시")).toBeVisible();
    await expect(page.getByText("장소 힌트")).toBeVisible();
    await expect(page.getByText("만남 제안하기")).toBeVisible();
  });

  test("friendshipId 없이 접속 시 오류 메시지", async ({ page }) => {
    await page.goto("/offline");

    await expect(
      page.getByText(/friendshipId가 필요합니다|오류|에러/),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("D-009 오프라인 상세 응답/체크인", () => {
  test("제안 상세 렌더링", async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.offlineDetail(TEST_PROPOSAL_ID),
    );

    await page.goto(`/offline/${TEST_PROPOSAL_ID}`);

    await expect(
      page.getByRole("heading", { name: "오프라인 만남" }),
    ).toBeVisible();
  });

  test("응답 및 체크인 버튼 표시", async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.offlineDetail(TEST_PROPOSAL_ID),
    );

    await page.goto(`/offline/${TEST_PROPOSAL_ID}`);

    // Component renders response and safety checkin sections without data fetch
    await expect(page.getByRole("button", { name: "확정" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("button", { name: "취소" })).toBeVisible();
    await expect(page.getByRole("button", { name: "안전" })).toBeVisible();
    await expect(page.getByRole("button", { name: "우려" })).toBeVisible();
  });
});
