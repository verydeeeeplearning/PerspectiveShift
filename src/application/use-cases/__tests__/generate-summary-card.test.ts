import { describe, it, expect, vi } from "vitest";
import { GenerateSummaryCardUseCase } from "../generate-summary-card";
import { DialogueSession } from "@/domain/entities/dialogue-session";
import { DialogueTurn } from "@/domain/entities/dialogue-turn";
import { SummaryCard } from "@/domain/entities/summary-card";
import { SessionNotCompletedError } from "@/domain/errors/domain-errors";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { FeedbackRepository } from "@/domain/interfaces/feedback-repository";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type { SummaryGenerator } from "@/domain/interfaces/summary-generator";

function makeCompletedSession() {
  const now = new Date();
  const session = DialogueSession.create({
    id: "session-1",
    participantA: "alice",
    participantB: "bob",
    currentStep: "POSITION",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  });
  const steps = ["POSITION", "QUESTION", "ANSWER", "REFLECTION"] as const;
  let counter = 0;
  for (const step of steps) {
    for (const pid of ["alice", "bob"]) {
      counter++;
      session.submitTurn(
        DialogueTurn.create({
          id: `t-${counter}`,
          sessionId: "session-1",
          step,
          participantId: pid,
          content: `${pid} ${step} content`,
          createdAt: now,
        }),
      );
    }
  }
  return session;
}

describe("GenerateSummaryCardUseCase", () => {
  function setup(opts: {
    session?: DialogueSession | null;
    existingCard?: SummaryCard | null;
  } = {}) {
    const dialogueRepo: DialogueRepository = {
      saveSession: vi.fn(),
      findSessionById: vi.fn().mockResolvedValue(
        opts.session ?? makeCompletedSession(),
      ),
      findSessionsByParticipant: vi.fn(),
      saveTurn: vi.fn(),
      updateSession: vi.fn(),
      findActiveSessions: vi.fn(),
    };
    const feedbackRepo: FeedbackRepository = {
      saveFeedback: vi.fn(),
      findFeedback: vi.fn(),
      saveUnderstandingScore: vi.fn(),
      findUnderstandingScore: vi.fn(),
      saveSummaryCard: vi.fn(),
      findSummaryCard: vi.fn().mockResolvedValue(opts.existingCard ?? null),
    };
    const piiScrubber: PiiScrubber = {
      scrub: vi.fn().mockImplementation((text: string) => ({
        scrubbed: text,
        piiDetected: false,
        detectedTypes: [],
      })),
    };
    const summaryGenerator: SummaryGenerator = {
      generateSummary: vi.fn().mockResolvedValue({
        keyArguments: { participantA: ["arg1"], participantB: ["arg2"] },
        commonGround: ["common"],
        unresolvedQuestions: ["question"],
        blindSpots: ["blind"],
      }),
      evaluateUnderstanding: vi.fn(),
    };
    const uc = new GenerateSummaryCardUseCase({
      dialogueRepository: dialogueRepo,
      feedbackRepository: feedbackRepo,
      piiScrubber,
      summaryGenerator,
    });
    return { uc, piiScrubber, summaryGenerator, feedbackRepo };
  }

  it("generates summary with PII scrubbing", async () => {
    const { uc, piiScrubber, summaryGenerator } = setup();
    const result = await uc.execute("session-1");
    expect(piiScrubber.scrub).toHaveBeenCalled();
    expect(summaryGenerator.generateSummary).toHaveBeenCalledOnce();
    expect(result.keyArguments.participantA).toContain("arg1");
    expect(result.commonGround).toContain("common");
  });

  it("returns cached card if exists", async () => {
    const existing = SummaryCard.create({
      id: "cached",
      sessionId: "session-1",
      keyArguments: { participantA: ["cached"], participantB: [] },
      commonGround: [],
      unresolvedQuestions: [],
      blindSpots: [],
      createdAt: new Date(),
    });
    const { uc, summaryGenerator } = setup({ existingCard: existing });
    const result = await uc.execute("session-1");
    expect(result.id).toBe("cached");
    expect(summaryGenerator.generateSummary).not.toHaveBeenCalled();
  });

  it("saves generated card", async () => {
    const { uc, feedbackRepo } = setup();
    await uc.execute("session-1");
    expect(feedbackRepo.saveSummaryCard).toHaveBeenCalledOnce();
  });

  it("throws SessionNotCompletedError for active session", async () => {
    const active = DialogueSession.create({
      id: "session-1",
      participantA: "alice",
      participantB: "bob",
      currentStep: "POSITION",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    });
    const { uc } = setup({ session: active });
    await expect(uc.execute("session-1")).rejects.toThrow(
      SessionNotCompletedError,
    );
  });
});
