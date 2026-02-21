import { test, expect } from "@playwright/test";
import { hasHorizontalScroll } from "../fixtures/test-data";

const viewports = [
  { width: 390, height: 844, label: "모바일 (390x844)" },
  { width: 768, height: 1024, label: "태블릿 (768x1024)" },
  { width: 1440, height: 900, label: "데스크톱 (1440x900)" },
];

const pages = [
  { path: "/", name: "랜딩" },
  { path: "/onboarding", name: "온보딩" },
  { path: "/matching", name: "매칭" },
  { path: "/dialogue", name: "대화 목록" },
  { path: "/auth/login", name: "로그인" },
];

test.describe("G-006 반응형 레이아웃 검증", () => {
  for (const vp of viewports) {
    for (const pg of pages) {
      test(`${vp.label} - ${pg.name} (${pg.path}) 가로 스크롤 없음`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(pg.path);

        // Wait for page content to load
        await page.waitForLoadState("domcontentloaded");

        const hScroll = await hasHorizontalScroll(page);
        expect(hScroll).toBe(false);
      });
    }
  }
});

test.describe("G-006 모바일 탭바 레이아웃", () => {
  test("모바일 뷰포트에서 탭바 겹침 없이 표시", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/matching");

    const tabbar = page.getByRole("tablist", { name: "메인 네비게이션" });
    await expect(tabbar).toBeVisible();

    // Verify all tabs are visible without overflow
    await expect(
      tabbar.getByRole("tab", { name: "매칭" }),
    ).toBeVisible();
    await expect(
      tabbar.getByRole("tab", { name: "대화" }),
    ).toBeVisible();
    await expect(
      tabbar.getByRole("tab", { name: "로그인" }),
    ).toBeVisible();
  });
});
