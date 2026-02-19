import { describe, it, expect, vi } from "vitest";
import { GenerateJointSummaryUseCase } from "../generate-joint-summary";
import type { SummaryGenerator } from "@/domain/interfaces/summary-generator";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import { DialogueSession } from "@/domain/entities/dialogue-session";
import { DialogueTurn } from "@/domain/entities/dialogue-turn";

function mockSummaryGenerator(): SummaryGenerator {
  return {
    generateSummary: vi.fn().mockResolvedValue({
      keyArguments: { participantA: ["arg1"], participantB: ["arg2"] },
      commonGround: ["안전 중요"],
      unresolvedQuestions: ["규제 정도는?"],
      blindSpots: [],
    }),
    evaluateUnderstanding: vi.fn(),
  };
}

function mockDialogueRepo(): DialogueRepository {
  const turns = [
    DialogueTurn.create({
      id: "t1",
      sessionId: "sess-1",
      step: "POSITION",
      participantId: "alice",
      content: "기술 규제가 필요합니다",
      createdAt: new Date(),
    }),
    DialogueTurn.create({
      id: "t2",
      sessionId: "sess-1",
      step: "POSITION",
      participantId: "bob",
      content: "과도한 규제는 혁신을 막습니다",
      createdAt: new Date(),
    }),
  ];

  const session = DialogueSession.reconstitute({
    id: "sess-1",
    participantA: "alice",
    participantB: "bob",
    currentStep: "JOINT_SUMMARY",
    status: "ACTIVE",
    turns,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivityAt: new Date(),
  });

  return {
    saveSession: vi.fn(),
    findSessionById: vi.fn().mockResolvedValue(session),
    findSessionsByParticipant: vi.fn().mockResolvedValue([]),
    updateSession: vi.fn(),
    findActiveSessions: vi.fn().mockResolvedValue([]),
    saveTurn: vi.fn(),
  };
}

describe("GenerateJointSummaryUseCase", () => {
  it("generates joint summary from dialogue", async () => {
    const repo = mockDialogueRepo();
    const generator = mockSummaryGenerator();
    const uc = new GenerateJointSummaryUseCase({
      dialogueRepository: repo,
      summaryGenerator: generator,
    });

    const result = await uc.execute("sess-1");

    expect(result.sessionId).toBe("sess-1");
    expect(result.agreedPoints).toEqual(["안전 중요"]);
    expect(result.disagreedPoints).toHaveLength(0);
    expect(result.sharedQuestions).toEqual(["규제 정도는?"]);
    expect(result.llmGenerated).toBe(true);
  });

  it("throws when session not found", async () => {
    const repo = mockDialogueRepo();
    (repo.findSessionById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const generator = mockSummaryGenerator();
    const uc = new GenerateJointSummaryUseCase({
      dialogueRepository: repo,
      summaryGenerator: generator,
    });

    await expect(uc.execute("missing")).rejects.toThrow();
  });
});
