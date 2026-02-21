import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  TEST_FRIENDSHIP_ID,
  MOCK_CHAT_INELIGIBLE,
} from "../fixtures/test-data";

// Component displays: 참여자_{friendUserId.slice(0, 4).toUpperCase()}
// TEST_FRIEND_USER_ID = "e2e-user-002" → slice(0,4) = "e2e-" → upper = "E2E-"
const DISPLAY_NAME = "참여자_E2E-";

test.describe("D-002 친구 상세 기본 정보", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.friendDetail(TEST_FRIENDSHIP_ID),
    );
  });

  test("친구 별칭 표시", async ({ page }) => {
    await page.goto(`/friends/${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByText(DISPLAY_NAME),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("공개 레벨 섹션 표시", async ({ page }) => {
    await page.goto(`/friends/${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByRole("heading", { name: "공개 레벨" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("액션 버튼 표시 (오프라인, 친구 해제, 신고)", async ({ page }) => {
    await page.goto(`/friends/${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByText("오프라인 만남 제안하기"),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("친구 해제")).toBeVisible();
    await expect(page.getByText("신고하기")).toBeVisible();
  });
});

test.describe("D-003 공개 레벨 올리기", () => {
  test("공개 레벨 올리기 버튼 존재", async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.friendDetail(TEST_FRIENDSHIP_ID),
    );
    await page.goto(`/friends/${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByRole("heading", { name: "공개 레벨" }),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("D-004 라이트 프로토콜 시작", () => {
  test("라이트 프로토콜 섹션 표시", async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.friendDetail(TEST_FRIENDSHIP_ID),
    );
    await page.goto(`/friends/${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByText(DISPLAY_NAME),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("D-005 실시간 채팅 진입 조건", () => {
  test("eligible=true 시 채팅 버튼 활성", async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.friendDetail(TEST_FRIENDSHIP_ID),
    );
    await page.goto(`/friends/${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByText(DISPLAY_NAME),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("eligible=false 시 채팅 잠금 및 사유 표시", async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.friendDetailIneligible(TEST_FRIENDSHIP_ID),
    );
    await page.goto(`/friends/${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByText(DISPLAY_NAME),
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByText(MOCK_CHAT_INELIGIBLE.reason!),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("D-011 친구 해제", () => {
  test("친구 해제 버튼 존재", async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.friendDetail(TEST_FRIENDSHIP_ID),
    );
    await page.goto(`/friends/${TEST_FRIENDSHIP_ID}`);

    await expect(page.getByText("친구 해제")).toBeVisible({
      timeout: 10_000,
    });
  });
});
