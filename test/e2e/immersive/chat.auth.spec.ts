import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  TEST_FRIENDSHIP_ID,
  MOCK_CHAT_MESSAGES,
} from "../fixtures/test-data";

// Mock Supabase API calls that the browser client might make (token refresh, etc.)
// Do NOT override the auth cookie — the real cookie from storage state is needed
// for the server-side middleware to accept the session.
async function mockSupabaseForClient(page: import("@playwright/test").Page) {
  await page.route(
    "**/onlzhunpcwvvbhjpcghi.supabase.co/**",
    async (route) => {
      const url = route.request().url();
      if (url.includes("/realtime/")) {
        // Abort WebSocket upgrade requests to avoid hanging connections
        await route.abort("connectionrefused");
      } else if (url.includes("/auth/v1/")) {
        // Let auth requests fall through to real Supabase
        await route.continue();
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
      }
    },
  );
}

test.describe("D-006 채팅 페이지 기본 동작", () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseForClient(page);
    await setupMockRoutes(page, MOCK_ROUTES.chat(TEST_FRIENDSHIP_ID));
  });

  test("채팅 헤더 렌더링", async ({ page }) => {
    await page.goto(`/chat/${TEST_FRIENDSHIP_ID}`);

    await expect(page.getByText("채팅")).toBeVisible({ timeout: 15_000 });
  });

  test("기존 메시지 표시", async ({ page }) => {
    await page.goto(`/chat/${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByText(MOCK_CHAT_MESSAGES.messages[0].content),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText(MOCK_CHAT_MESSAGES.messages[1].content),
    ).toBeVisible();
  });

  test("뒤로가기 네비게이션 링크 존재", async ({ page }) => {
    await page.goto(`/chat/${TEST_FRIENDSHIP_ID}`);

    const backLink = page.locator("a[href*='/friends']").first();
    await expect(backLink).toBeVisible({ timeout: 15_000 });
  });

  test("메시지 입력 영역 존재", async ({ page }) => {
    await page.goto(`/chat/${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByText(MOCK_CHAT_MESSAGES.messages[0].content),
    ).toBeVisible({ timeout: 15_000 });

    const input = page.locator(
      "input[type='text'], textarea, [contenteditable='true']",
    );
    await expect(input.first()).toBeVisible();
  });
});
