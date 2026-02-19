import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @supabase/ssr before imports
const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

// We need to dynamically import because middleware uses top-level imports
// that get hoisted above our mocks if imported statically
const { middleware } = await import("@/middleware");

function createMockRequest(pathname: string): Request & {
  nextUrl: URL;
  cookies: {
    getAll: () => Array<{ name: string; value: string }>;
    set: (name: string, value: string) => void;
  };
  url: string;
} {
  const url = `http://localhost:3000${pathname}`;
  const nextUrl = new URL(url);
  return {
    nextUrl,
    url,
    headers: new Headers(),
    cookies: {
      getAll: () => [],
      set: vi.fn(),
    },
  } as unknown as Request & {
    nextUrl: URL;
    cookies: {
      getAll: () => Array<{ name: string; value: string }>;
      set: (name: string, value: string) => void;
    };
    url: string;
  };
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows public routes without authentication", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest("/");
    const response = await middleware(request as never);
    expect(response.status).not.toBe(307);
  });

  it("allows anonymous routes like /onboarding", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest("/onboarding");
    const response = await middleware(request as never);
    expect(response.status).not.toBe(307);
  });

  it("allows anonymous routes like /matching", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest("/matching");
    const response = await middleware(request as never);
    expect(response.status).not.toBe(307);
  });

  it("redirects unauthenticated users from /friends to /auth/login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest("/friends");
    const response = await middleware(request as never);
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/auth/login");
    expect(location).toContain("next=%2Ffriends");
  });

  it("redirects unauthenticated users from /chat/123 to /auth/login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest("/chat/some-friendship-id");
    const response = await middleware(request as never);
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/auth/login");
  });

  it("redirects unauthenticated users from /offline to /auth/login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest("/offline");
    const response = await middleware(request as never);
    expect(response.status).toBe(307);
  });

  it("redirects unauthenticated users from /safety/report to /auth/login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest("/safety/report");
    const response = await middleware(request as never);
    expect(response.status).toBe(307);
  });

  it("allows authenticated users to access protected routes", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@test.com" } },
    });
    const request = createMockRequest("/friends");
    const response = await middleware(request as never);
    expect(response.status).not.toBe(307);
  });

  it("redirects authenticated users from /auth/login to /friends", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@test.com" } },
    });
    const request = createMockRequest("/auth/login");
    const response = await middleware(request as never);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/friends");
  });

  it("allows unauthenticated users to visit /auth/login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest("/auth/login");
    const response = await middleware(request as never);
    expect(response.status).not.toBe(307);
  });

  it("passes through dialogue routes without auth", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest("/dialogue/session-123");
    const response = await middleware(request as never);
    expect(response.status).not.toBe(307);
  });
});
