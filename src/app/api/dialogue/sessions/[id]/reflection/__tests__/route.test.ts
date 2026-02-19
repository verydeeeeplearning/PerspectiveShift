import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/infrastructure/config/di-container", () => ({
  getContainer: vi.fn(),
}));

import { getContainer } from "@/infrastructure/config/di-container";
import { POST } from "../route";

const mockExecute = vi.fn();

beforeEach(() => {
  vi.mocked(getContainer).mockReturnValue({
    submitReflectionUseCase: { execute: mockExecute },
  } as never);
  mockExecute.mockReset();
});

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/dialogue/sessions/s1/reflection", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/dialogue/sessions/[id]/reflection", () => {
  it("returns 401 when x-session-id header is missing", async () => {
    const res = await POST(
      makeRequest({ items: [{ type: "SUMMARY", content: "test" }] }),
      { params: Promise.resolve({ id: "s1" }) },
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/Missing X-Session-Id/i);
  });

  it("returns 400 for invalid input (empty items)", async () => {
    const res = await POST(
      makeRequest({ items: [] }, { "x-session-id": "user-1" }),
      { params: Promise.resolve({ id: "s1" }) },
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid input");
  });

  it("returns reflection result on success", async () => {
    const output = {
      sessionId: "s1",
      participantId: "user-1",
      items: [{ type: "SUMMARY", content: "They argued...", isRequired: true }],
      submittedAt: "2026-02-20T00:00:00.000Z",
    };
    mockExecute.mockResolvedValue(output);

    const res = await POST(
      makeRequest(
        { items: [{ type: "SUMMARY", content: "They argued..." }] },
        { "x-session-id": "user-1" },
      ),
      { params: Promise.resolve({ id: "s1" }) },
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual(output);
    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "s1",
        participantId: "user-1",
        items: [{ type: "SUMMARY", content: "They argued..." }],
      }),
    );
  });
});
