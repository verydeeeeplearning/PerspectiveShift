import { test, expect } from "@playwright/test";

test.describe("A-001 익명 유저 보호 라우트 리다이렉트", () => {
  const protectedRoutes = [
    "/friends",
    "/friends/some-id",
    "/chat/some-friendship-id",
    "/offline/some-id",
    "/safety/report",
    "/settings",
    "/settings/data-management",
    "/settings/notifications",
  ];

  for (const route of protectedRoutes) {
    test(`${route} → /auth/login?next=... 리다이렉트`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/auth\/login/);
      const url = new URL(page.url());
      expect(url.searchParams.get("next")).toBe(route);
    });
  }
});

test.describe("A-002 익명 유저 공개 라우트 접근", () => {
  const publicRoutes = [
    { path: "/", heading: /새로운 관점/ },
    { path: "/onboarding", heading: /생각 발견|당신의 생각/ },
    { path: "/matching", heading: /대화 상대 찾기/ },
    { path: "/dialogue", heading: /대화 목록/ },
    { path: "/auth/login", heading: /PerspectiveShift/ },
  ];

  for (const { path, heading } of publicRoutes) {
    test(`${path} 리다이렉트 없이 접근`, async ({ page }) => {
      await page.goto(path);
      await expect(page).not.toHaveURL(/\/auth\/login\?next/);
    });
  }
});
