import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  TEST_FRIENDSHIP_ID,
} from "../fixtures/test-data";

test.describe("Smoke: authenticated pages render", () => {
  test("friends page renders", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.friends);
    await page.goto("/friends");
    await expect(
      page.getByRole("heading", { name: "친구 목록" }),
    ).toBeVisible();
  });

  test("friend detail page renders", async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.friendDetail(TEST_FRIENDSHIP_ID),
    );
    await page.goto(`/friends/${TEST_FRIENDSHIP_ID}`);
    await expect(
      page.getByRole("heading", { name: "공개 레벨" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("safety report page renders", async ({ page }) => {
    await setupMockRoutes(page, MOCK_ROUTES.safetyReport);
    await page.goto("/safety/report?userId=smoke-test");
    await expect(
      page.getByRole("heading", { name: "사용자 신고" }),
    ).toBeVisible();
  });

  test("chat page renders", async ({ page }) => {
    // Mock Supabase client-side requests (do NOT override auth cookie)
    await page.route(
      "**/onlzhunpcwvvbhjpcghi.supabase.co/**",
      async (route) => {
        const url = route.request().url();
        if (url.includes("/realtime/")) {
          await route.abort("connectionrefused");
        } else if (url.includes("/auth/v1/")) {
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

    await setupMockRoutes(page, MOCK_ROUTES.chat(TEST_FRIENDSHIP_ID));
    await page.goto(`/chat/${TEST_FRIENDSHIP_ID}`);
    await expect(page.getByText("채팅")).toBeVisible({ timeout: 15_000 });
  });
});
