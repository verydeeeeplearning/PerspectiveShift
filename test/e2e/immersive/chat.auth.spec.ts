import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  TEST_FRIENDSHIP_ID,
  MOCK_CHAT_MESSAGES,
} from "../fixtures/test-data";

test.describe("Chat page (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.chat(TEST_FRIENDSHIP_ID),
    );
  });

  test("renders chat heading", async ({ page }) => {
    await page.goto(`/chat/${TEST_FRIENDSHIP_ID}`);

    await expect(page.getByText("채팅")).toBeVisible();
  });

  test("shows existing messages", async ({ page }) => {
    await page.goto(`/chat/${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByText(MOCK_CHAT_MESSAGES.messages[0].content),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText(MOCK_CHAT_MESSAGES.messages[1].content),
    ).toBeVisible();
  });

  test("has back navigation link", async ({ page }) => {
    await page.goto(`/chat/${TEST_FRIENDSHIP_ID}`);

    // Chat page has a back link in the header
    const backLink = page.locator("a[href*='/friends']").first();
    await expect(backLink).toBeVisible({ timeout: 10_000 });
  });
});
