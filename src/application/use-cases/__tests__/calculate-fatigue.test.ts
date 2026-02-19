import { describe, it, expect, vi } from "vitest";
import { CalculateFatigueUseCase } from "../calculate-fatigue";
import { DialogueSession } from "@/domain/entities/dialogue-session";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { FeedbackRepository } from "@/domain/interfaces/feedback-repository";

function mockRepos(opts: {
  sessionCount?: number;
  negativeEmotion?: boolean;
} = {}): { dialogueRepo: DialogueRepository; feedbackRepo: FeedbackRepository } {
  const sessions = Array.from({ length: opts.sessionCount ?? 1 }, (_, i) =>
    DialogueSession.create({
      id: `s-${i}`,
      participantA: "alice",
      participantB: "bob",
      currentStep: "POSITION",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    }),
  );
  return {
    dialogueRepo: {
      saveSession: vi.fn(),
      findSessionById: vi.fn(),
      findSessionsByParticipant: vi.fn().mockResolvedValue(sessions),
      saveTurn: vi.fn(),
      updateSession: vi.fn(),
      findActiveSessions: vi.fn(),
    },
    feedbackRepo: {
      saveFeedback: vi.fn(),
      findFeedback: vi.fn().mockResolvedValue(
        opts.negativeEmotion
          ? { emotionCheckIn: "frustrated" }
          : { emotionCheckIn: "hopeful" },
      ),
      saveUnderstandingScore: vi.fn(),
      findUnderstandingScore: vi.fn(),
      saveSummaryCard: vi.fn(),
      findSummaryCard: vi.fn(),
    },
  };
}

describe("CalculateFatigueUseCase", () => {
  it("returns LOW fatigue for few recent dialogues", async () => {
    const { dialogueRepo, feedbackRepo } = mockRepos({ sessionCount: 1 });
    const uc = new CalculateFatigueUseCase({ dialogueRepository: dialogueRepo, feedbackRepository: feedbackRepo });
    const result = await uc.execute("alice");
    expect(result.level).toBe("LOW");
    expect(result.needsCooldown).toBe(false);
  });

  it("returns HIGH fatigue for 5+ recent dialogues", async () => {
    const { dialogueRepo, feedbackRepo } = mockRepos({ sessionCount: 5 });
    const uc = new CalculateFatigueUseCase({ dialogueRepository: dialogueRepo, feedbackRepository: feedbackRepo });
    const result = await uc.execute("alice");
    expect(result.level).toBe("HIGH");
    expect(result.needsCooldown).toBe(true);
  });

  it("returns cooldown info when HIGH", async () => {
    const { dialogueRepo, feedbackRepo } = mockRepos({ sessionCount: 6 });
    const uc = new CalculateFatigueUseCase({ dialogueRepository: dialogueRepo, feedbackRepository: feedbackRepo });
    const result = await uc.execute("alice");
    expect(result.cooldown).toBeDefined();
    expect(result.cooldown!.active).toBe(true);
  });
});
