import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/infrastructure/config/di-container", () => ({
  getContainer: vi.fn(),
}));

import { getContainer } from "@/infrastructure/config/di-container";
import { POST } from "../route";

const mockExecute = vi.fn();

beforeEach(() => {
  vi.mocked(getContainer).mockReturnValue({
    createAgentDialogueSessionUseCase: { execute: mockExecute },
  } as never);
  mockExecute.mockReset();
});

function makeRequest(
  body: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest("http://localhost/api/dialogue/sessions", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/dialogue/sessions", () => {
  it("returns 401 when x-session-id header is missing", async () => {
    const res = await POST(
      makeRequest({ candidateType: "agent", personaId: "persona-1" }),
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/Missing X-Session-Id/i);
  });

  it("returns 400 when agent personaId is missing", async () => {
    const res = await POST(
      makeRequest({ candidateType: "agent" }, { "x-session-id": "session-1" }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/personaId/i);
  });

  it("creates agent session and returns 201", async () => {
    mockExecute.mockResolvedValue({
      id: "dialogue-1",
      currentStep: "POSITION",
      status: "ACTIVE",
      personaId: "persona-1",
    });

    const res = await POST(
      makeRequest(
        { candidateType: "agent", personaId: "persona-1" },
        { "x-session-id": "session-1" },
      ),
    );

    expect(res.status).toBe(201);
    expect(mockExecute).toHaveBeenCalledWith({
      participantSessionId: "session-1",
      personaId: "persona-1",
    });
    const body = await res.json();
    expect(body).toEqual({
      id: "dialogue-1",
      currentStep: "POSITION",
      status: "ACTIVE",
      personaId: "persona-1",
    });
  });
});
