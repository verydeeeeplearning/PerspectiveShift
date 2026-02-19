import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/infrastructure/config/di-container", () => ({
  getContainer: vi.fn(),
}));

import { getContainer } from "@/infrastructure/config/di-container";
import { GET } from "../route";

const mockExecute = vi.fn();

beforeEach(() => {
  vi.mocked(getContainer).mockReturnValue({
    generateJointSummaryUseCase: { execute: mockExecute },
  } as never);
  mockExecute.mockReset();
});

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/dialogue/sessions/s1/joint-summary", {
    headers,
  });
}

describe("GET /api/dialogue/sessions/[id]/joint-summary", () => {
  it("returns 401 when x-session-id header is missing", async () => {
    const res = await GET(makeRequest(), { params: Promise.resolve({ id: "s1" }) });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/Missing X-Session-Id/i);
  });

  it("returns joint summary on success", async () => {
    const summary = {
      sessionId: "s1",
      agreedPoints: ["point-a"],
      disagreedPoints: [],
      sharedQuestions: ["q1"],
      llmGenerated: true,
    };
    mockExecute.mockResolvedValue(summary);

    const res = await GET(
      makeRequest({ "x-session-id": "user-1" }),
      { params: Promise.resolve({ id: "s1" }) },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(summary);
    expect(mockExecute).toHaveBeenCalledWith("s1");
  });

  it("delegates errors to handleError", async () => {
    mockExecute.mockRejectedValue(new Error("Session not found"));

    const res = await GET(
      makeRequest({ "x-session-id": "user-1" }),
      { params: Promise.resolve({ id: "s1" }) },
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Session not found");
  });
});
