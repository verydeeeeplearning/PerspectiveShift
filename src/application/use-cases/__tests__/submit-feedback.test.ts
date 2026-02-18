import { describe, it, expect, vi } from "vitest";
import { SubmitFeedbackUseCase } from "../submit-feedback";
import { DialogueSession } from "@/domain/entities/dialogue-session";
import { DialogueTurn } from "@/domain/entities/dialogue-turn";
import {
  SessionNotCompletedError,
  DuplicateFeedbackError,
} from "@/domain/errors/domain-errors";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { FeedbackRepository } from "@/domain/interfaces/feedback-repository";

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
          content: `${pid} ${step}`,
          createdAt: now,
        }),
      );
    }
  }
  return session;
}

describe("SubmitFeedbackUseCase", () => {
  function setup(opts: { completed?: boolean; existingFeedback?: boolean } = {}) {
    const session = opts.completed !== false
      ? makeCompletedSession()
      : DialogueSession.create({
          id: "session-1",
          participantA: "alice",
          participantB: "bob",
          currentStep: "POSITION",
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActivityAt: new Date(),
        });

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
      findFeedback: vi.fn().mockResolvedValue(
        opts.existingFeedback ? { id: "existing" } : null,
      ),
      saveUnderstandingScore: vi.fn(),
      findUnderstandingScore: vi.fn(),
      saveSummaryCard: vi.fn(),
      findSummaryCard: vi.fn(),
    };
    const uc = new SubmitFeedbackUseCase({
      dialogueRepository: dialogueRepo,
      feedbackRepository: feedbackRepo,
    });
    return { uc, feedbackRepo };
  }

  it("saves feedback for completed session", async () => {
    const { uc, feedbackRepo } = setup();
    const result = await uc.execute("session-1", "alice", 4, true, "hopeful");
    expect(result.satisfaction).toBe(4);
    expect(result.rematchWillingness).toBe(true);
    expect(feedbackRepo.saveFeedback).toHaveBeenCalledOnce();
  });

  it("throws SessionNotCompletedError for active session", async () => {
    const { uc } = setup({ completed: false });
    await expect(
      uc.execute("session-1", "alice", 4, true, null),
    ).rejects.toThrow(SessionNotCompletedError);
  });

  it("throws DuplicateFeedbackError when already submitted", async () => {
    const { uc } = setup({ existingFeedback: true });
    await expect(
      uc.execute("session-1", "alice", 4, true, null),
    ).rejects.toThrow(DuplicateFeedbackError);
  });
});
