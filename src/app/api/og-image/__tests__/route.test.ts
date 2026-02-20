import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/og ImageResponse before importing the route
vi.mock("next/og", () => ({
  ImageResponse: class MockImageResponse {
    body: ReadableStream | null = null;
    bodyUsed = false;
    headers: Headers;
    ok = true;
    redirected = false;
    status = 200;
    statusText = "OK";
    type = "basic" as ResponseType;
    url = "";

    constructor(
      public element: React.ReactElement,
      public options?: { width?: number; height?: number },
    ) {
      this.headers = new Headers({
        "content-type": "image/png",
      });
    }

    clone() {
      return this;
    }
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0));
    }
    blob() {
      return Promise.resolve(new Blob());
    }
    bytes() {
      return Promise.resolve(new Uint8Array());
    }
    formData() {
      return Promise.resolve(new FormData());
    }
    json() {
      return Promise.resolve({});
    }
    text() {
      return Promise.resolve("");
    }
  },
}));

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let GET: typeof import("../route").GET;

beforeEach(async () => {
  const mod = await import("../route");
  GET = mod.GET;
});

function createNextRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/og-image");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  // Simulate NextRequest with nextUrl property
  return {
    nextUrl: url,
    url: url.toString(),
  } as never;
}

describe("GET /api/og-image", () => {
  it("returns 200 with image/png content type", async () => {
    const request = createNextRequest({
      type: "ALIAS",
      alias: "균형 탐색가",
      emoji: "⚖️",
      description: "다양한 관점을 균형 있게 고려합니다.",
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
  });

  it("returns default/fallback with missing params", async () => {
    const request = createNextRequest();

    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
  });

  it("generates image with correct dimensions", async () => {
    const request = createNextRequest({ alias: "테스트" });

    const response = await GET(request);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options = (response as any).options;
    expect(options).toEqual({ width: 1200, height: 630 });
  });
});
