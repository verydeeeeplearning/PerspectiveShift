import { describe, it, expect, vi, beforeEach } from "vitest";

const { middleware } = await import("@/middleware");

function createMockRequest(
  pathname: string,
  cookies: Record<string, string> = {},
): Request & {
  nextUrl: URL;
  cookies: {
    getAll: () => Array<{ name: string; value: string }>;
    get: (name: string) => { name: string; value: string } | undefined;
    set: (name: string, value: string) => void;
  };
  url: string;
  headers: Headers;
} {
  const url = `http://localhost:3000${pathname}`;
  const nextUrl = new URL(url);
  const cookieEntries = Object.entries(cookies).map(([name, value]) => ({
    name,
    value,
  }));
  return {
    nextUrl,
    url,
    headers: new Headers(),
    cookies: {
      getAll: () => cookieEntries,
      get: (name: string) => cookieEntries.find((c) => c.name === name),
      set: vi.fn(),
    },
  } as never;
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows public routes without authentication", async () => {
    const request = createMockRequest("/");
    const response = await middleware(request as never);
    expect(response.status).not.toBe(307);
  });

  it("allows anonymous routes like /onboarding", async () => {
    const request = createMockRequest("/onboarding");
    const response = await middleware(request as never);
    expect(response.status).not.toBe(307);
  });

  it("allows anonymous routes like /matching", async () => {
    const request = createMockRequest("/matching");
    const response = await middleware(request as never);
    expect(response.status).not.toBe(307);
  });

  it("redirects unauthenticated users from /friends to /auth/login", async () => {
    const request = createMockRequest("/friends");
    const response = await middleware(request as never);
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/auth/login");
    expect(location).toContain("next=%2Ffriends");
  });

  it("redirects unauthenticated users from /chat/123 to /auth/login", async () => {
    const request = createMockRequest("/chat/some-friendship-id");
    const response = await middleware(request as never);
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/auth/login");
  });

  it("redirects unauthenticated users from /offline to /auth/login", async () => {
    const request = createMockRequest("/offline");
    const response = await middleware(request as never);
    expect(response.status).toBe(307);
  });

  it("redirects unauthenticated users from /safety/report to /auth/login", async () => {
    const request = createMockRequest("/safety/report");
    const response = await middleware(request as never);
    expect(response.status).toBe(307);
  });

  it("allows authenticated users to access protected routes", async () => {
    const request = createMockRequest("/friends", {
      ps_user_id: "test@test.com",
    });
    const response = await middleware(request as never);
    expect(response.status).not.toBe(307);
  });

  it("redirects authenticated users from /auth/login to /matching", async () => {
    const request = createMockRequest("/auth/login", {
      ps_user_id: "test@test.com",
    });
    const response = await middleware(request as never);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/matching");
  });

  it("allows unauthenticated users to visit /auth/login", async () => {
    const request = createMockRequest("/auth/login");
    const response = await middleware(request as never);
    expect(response.status).not.toBe(307);
  });

  it("passes through dialogue routes without auth", async () => {
    const request = createMockRequest("/dialogue/session-123");
    const response = await middleware(request as never);
    expect(response.status).not.toBe(307);
  });
});
