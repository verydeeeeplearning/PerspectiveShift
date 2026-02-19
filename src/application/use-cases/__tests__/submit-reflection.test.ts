import { describe, it, expect, vi } from "vitest";
import { SubmitReflectionUseCase } from "../submit-reflection";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import { DialogueSession } from "@/domain/entities/dialogue-session";
import { DialogueTurn } from "@/domain/entities/dialogue-turn";

function makeSession(): DialogueSession {
  const session = DialogueSession.create({
    id: "sess-1",
    participantA: "alice",
    participantB: "bob",
    currentStep: "REFLECTION",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivityAt: new Date(),
  });
  return session;
}

function mockDialogueRepo(session: DialogueSession | null): DialogueRepository {
  return {
    saveSession: vi.fn(),
    findSessionById: vi.fn().mockResolvedValue(session),
    findSessionsByParticipant: vi.fn().mockResolvedValue([]),
    updateSession: vi.fn(),
    findActiveSessions: vi.fn().mockResolvedValue([]),
    saveTurn: vi.fn(),
  };
}

describe("SubmitReflectionUseCase", () => {
  it("submits R1 (SUMMARY) reflection successfully", async () => {
    const session = makeSession();
    const repo = mockDialogueRepo(session);
    const uc = new SubmitReflectionUseCase({ dialogueRepository: repo });

    const result = await uc.execute({
      sessionId: "sess-1",
      participantId: "alice",
      items: [{ type: "SUMMARY", content: "상대는 기술 규제에 찬성합니다" }],
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].type).toBe("SUMMARY");
    expect(result.items[0].isRequired).toBe(true);
  });

  it("submits multiple reflection items", async () => {
    const session = makeSession();
    const repo = mockDialogueRepo(session);
    const uc = new SubmitReflectionUseCase({ dialogueRepository: repo });

    const result = await uc.execute({
      sessionId: "sess-1",
      participantId: "alice",
      items: [
        { type: "SUMMARY", content: "요약..." },
        { type: "ACCURACY_CHECK", content: "맞습니다" },
        { type: "COMMON_GROUND", content: "안전에 동의" },
      ],
    });

    expect(result.items).toHaveLength(3);
  });

  it("throws when session not found", async () => {
    const repo = mockDialogueRepo(null);
    const uc = new SubmitReflectionUseCase({ dialogueRepository: repo });

    await expect(
      uc.execute({
        sessionId: "missing",
        participantId: "alice",
        items: [{ type: "SUMMARY", content: "test" }],
      }),
    ).rejects.toThrow();
  });
});
