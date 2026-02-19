import { test, expect } from "@playwright/test";
import {
  setupMockRoutes,
  MOCK_ROUTES,
  TEST_PROPOSAL_ID,
  TEST_FRIENDSHIP_ID,
} from "../fixtures/test-data";

test.describe("Offline meeting pages (authenticated)", () => {
  test("proposal form renders with heading", async ({ page }) => {
    await page.goto(`/offline?friendshipId=${TEST_FRIENDSHIP_ID}`);

    await expect(
      page.getByRole("heading", { name: "오프라인 만남 제안" }),
    ).toBeVisible();
    await expect(page.getByText("제안 일시")).toBeVisible();
    await expect(page.getByText("장소 힌트")).toBeVisible();
    await expect(page.getByText("만남 제안하기")).toBeVisible();
  });

  test("proposal detail renders with action buttons", async ({ page }) => {
    await setupMockRoutes(
      page,
      MOCK_ROUTES.offlineDetail(TEST_PROPOSAL_ID),
    );

    // Mock the detail API to return proposal data
    await setupMockRoutes(page, [
      {
        pattern: `**/api/offline/proposals/${TEST_PROPOSAL_ID}`,
        response: {
          id: TEST_PROPOSAL_ID,
          friendshipId: TEST_FRIENDSHIP_ID,
          status: "PENDING",
          proposedAt: new Date().toISOString(),
          locationHint: "강남역 카페",
          safetyCheckinStatus: "NOT_STARTED",
        },
      },
    ]);

    await page.goto(`/offline/${TEST_PROPOSAL_ID}`);

    await expect(
      page.getByRole("heading", { name: "오프라인 만남" }),
    ).toBeVisible();
  });
});
