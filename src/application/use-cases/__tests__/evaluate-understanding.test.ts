import { describe, it, expect, vi } from "vitest";
import { EvaluateUnderstandingUseCase } from "../evaluate-understanding";
import { DialogueSession } from "@/domain/entities/dialogue-session";
import { DialogueTurn } from "@/domain/entities/dialogue-turn";
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
  const steps = ["POSITION", "QUESTION", "ANSWER", "REFLECTION", "JOINT_SUMMARY"] as const;
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

describe("EvaluateUnderstandingUseCase", () => {
  function setup(session: DialogueSession | null = makeCompletedSession()) {
    const dialogueRepo: DialogueRepository = {
      saveSession: vi.fn(),
      findSessionById: vi.fn().mockResolvedValue(session),
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
      findSummaryCard: vi.fn(),
    };
    const piiScrubber: PiiScrubber = {
      scrub: vi.fn().mockImplementation((text: string) => ({
        scrubbed: text,
        piiDetected: false,
        detectedTypes: [],
      })),
    };
    const summaryGenerator: SummaryGenerator = {
      generateSummary: vi.fn(),
      evaluateUnderstanding: vi.fn().mockResolvedValue({
        score: 0.75,
        evaluation: "Good understanding",
      }),
    };
    const uc = new EvaluateUnderstandingUseCase({
      dialogueRepository: dialogueRepo,
      feedbackRepository: feedbackRepo,
      piiScrubber,
      summaryGenerator,
    });
    return { uc, piiScrubber, summaryGenerator, feedbackRepo };
  }

  it("scrubs PII before LLM evaluation", async () => {
    const { uc, piiScrubber } = setup();
    await uc.execute("session-1", "alice");
    expect(piiScrubber.scrub).toHaveBeenCalled();
    const calls = (piiScrubber.scrub as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });

  it("evaluates using reflection vs opponent turns", async () => {
    const { uc, summaryGenerator } = setup();
    const result = await uc.execute("session-1", "alice");
    expect(summaryGenerator.evaluateUnderstanding).toHaveBeenCalledOnce();
    expect(result.score).toBe(0.75);
    expect(result.evaluation).toBe("Good understanding");
  });

  it("saves understanding score", async () => {
    const { uc, feedbackRepo } = setup();
    await uc.execute("session-1", "alice");
    expect(feedbackRepo.saveUnderstandingScore).toHaveBeenCalledOnce();
  });

  it("throws SessionNotCompletedError for active session", async () => {
    const activeSession = DialogueSession.create({
      id: "session-1",
      participantA: "alice",
      participantB: "bob",
      currentStep: "POSITION",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    });
    const { uc } = setup(activeSession);
    await expect(uc.execute("session-1", "alice")).rejects.toThrow(
      SessionNotCompletedError,
    );
  });
});
