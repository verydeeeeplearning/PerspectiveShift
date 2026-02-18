import { describe, it, expect } from "vitest";
import { DialogueSession } from "../dialogue-session";
import { DialogueTurn } from "../dialogue-turn";
import {
  InvalidDialogueTransitionError,
  DuplicateSubmissionError,
  UnauthorizedParticipantError,
  SessionNotActiveError,
} from "../../errors/domain-errors";

let turnCounter = 0;

function makeSession(overrides: Partial<{
  lastActivityAt: Date;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED" | "CANCELLED";
}> = {}) {
  const now = new Date();
  return DialogueSession.create({
    id: "session-1",
    participantA: "alice",
    participantB: "bob",
    currentStep: "POSITION",
    status: overrides.status ?? "ACTIVE",
    createdAt: now,
    updatedAt: now,
    lastActivityAt: overrides.lastActivityAt ?? now,
  });
}

function turn(
  participantId: string,
  step: "POSITION" | "QUESTION" | "ANSWER" | "REFLECTION",
  content = "test content",
) {
  turnCounter++;
  return DialogueTurn.create({
    id: `turn-${turnCounter}`,
    sessionId: "session-1",
    step,
    participantId,
    content,
    createdAt: new Date(),
  });
}

function advanceToStep(
  session: DialogueSession,
  targetStep: "QUESTION" | "ANSWER" | "REFLECTION",
) {
  const steps: Array<"POSITION" | "QUESTION" | "ANSWER" | "REFLECTION"> = [
    "POSITION",
    "QUESTION",
    "ANSWER",
    "REFLECTION",
  ];
  const targetIdx = steps.indexOf(targetStep);

  for (let i = 0; i < targetIdx; i++) {
    session.submitTurn(turn("alice", steps[i]));
    session.submitTurn(turn("bob", steps[i]));
  }
}

describe("DialogueSession State Machine - Deep Tests", () => {
  describe("Happy Path: POSITION → QUESTION → ANSWER → REFLECTION → COMPLETED", () => {
    it("progresses through all 4 steps to completion", () => {
      const s = makeSession();

      s.submitTurn(turn("alice", "POSITION", "My position..."));
      s.submitTurn(turn("bob", "POSITION", "My position..."));
      expect(s.currentStep).toBe("QUESTION");

      s.submitTurn(turn("alice", "QUESTION", "Why do you think...?"));
      s.submitTurn(turn("bob", "QUESTION", "What about...?"));
      expect(s.currentStep).toBe("ANSWER");

      s.submitTurn(turn("alice", "ANSWER", "Because..."));
      s.submitTurn(turn("bob", "ANSWER", "I believe..."));
      expect(s.currentStep).toBe("REFLECTION");

      s.submitTurn(turn("alice", "REFLECTION", "I now understand..."));
      expect(s.status).toBe("ACTIVE");
      expect(s.currentStep).toBe("REFLECTION");

      s.submitTurn(turn("bob", "REFLECTION", "I learned..."));
      expect(s.status).toBe("COMPLETED");
    });

    it("accumulates 8 turns total", () => {
      const s = makeSession();
      advanceToStep(s, "REFLECTION");
      s.submitTurn(turn("alice", "REFLECTION"));
      s.submitTurn(turn("bob", "REFLECTION"));
      expect(s.turns).toHaveLength(8);
    });
  });

  describe("Bilateral Lock", () => {
    it("does not advance until both participants submit for current step", () => {
      const s = makeSession();
      s.submitTurn(turn("alice", "POSITION"));
      expect(s.currentStep).toBe("POSITION");
      expect(s.turns).toHaveLength(1);
    });

    it("advances immediately when second participant submits", () => {
      const s = makeSession();
      s.submitTurn(turn("bob", "POSITION"));
      expect(s.currentStep).toBe("POSITION");
      s.submitTurn(turn("alice", "POSITION"));
      expect(s.currentStep).toBe("QUESTION");
    });

    it("order of submission does not matter", () => {
      const s = makeSession();
      s.submitTurn(turn("bob", "POSITION"));
      s.submitTurn(turn("alice", "POSITION"));
      expect(s.currentStep).toBe("QUESTION");

      s.submitTurn(turn("alice", "QUESTION"));
      s.submitTurn(turn("bob", "QUESTION"));
      expect(s.currentStep).toBe("ANSWER");
    });
  });

  describe("Duplicate Submission", () => {
    it("throws DuplicateSubmissionError when same participant submits same step twice", () => {
      const s = makeSession();
      s.submitTurn(turn("alice", "POSITION"));
      expect(() =>
        s.submitTurn(turn("alice", "POSITION")),
      ).toThrow(DuplicateSubmissionError);
    });

    it("includes participant and step in error message", () => {
      const s = makeSession();
      s.submitTurn(turn("alice", "POSITION"));
      try {
        s.submitTurn(turn("alice", "POSITION"));
      } catch (e) {
        expect((e as Error).message).toContain("alice");
        expect((e as Error).message).toContain("POSITION");
      }
    });
  });

  describe("Unauthorized Participant", () => {
    it("throws UnauthorizedParticipantError for non-participant", () => {
      const s = makeSession();
      expect(() =>
        s.submitTurn(turn("eve", "POSITION")),
      ).toThrow(UnauthorizedParticipantError);
    });

    it("includes participant id in error message", () => {
      const s = makeSession();
      try {
        s.submitTurn(turn("mallory", "POSITION"));
      } catch (e) {
        expect((e as Error).message).toContain("mallory");
      }
    });
  });

  describe("Expired Session", () => {
    it("throws SessionNotActiveError for expired session", () => {
      const s = makeSession();
      s.markExpired();
      expect(s.status).toBe("EXPIRED");
      expect(() =>
        s.submitTurn(turn("alice", "POSITION")),
      ).toThrow(SessionNotActiveError);
    });

    it("throws SessionNotActiveError for completed session", () => {
      const s = makeSession();
      advanceToStep(s, "REFLECTION");
      s.submitTurn(turn("alice", "REFLECTION"));
      s.submitTurn(turn("bob", "REFLECTION"));
      expect(() =>
        s.submitTurn(turn("alice", "POSITION")),
      ).toThrow(SessionNotActiveError);
    });

    it("throws SessionNotActiveError for cancelled session", () => {
      const s = makeSession();
      s.cancel();
      expect(() =>
        s.submitTurn(turn("alice", "POSITION")),
      ).toThrow(SessionNotActiveError);
    });
  });

  describe("Step Skip Prevention", () => {
    it("cannot submit QUESTION when on POSITION step", () => {
      const s = makeSession();
      expect(() =>
        s.submitTurn(turn("alice", "QUESTION")),
      ).toThrow(InvalidDialogueTransitionError);
    });

    it("cannot submit ANSWER when on POSITION step", () => {
      const s = makeSession();
      expect(() =>
        s.submitTurn(turn("alice", "ANSWER")),
      ).toThrow(InvalidDialogueTransitionError);
    });

    it("cannot submit REFLECTION when on QUESTION step", () => {
      const s = makeSession();
      advanceToStep(s, "QUESTION");
      expect(() =>
        s.submitTurn(turn("alice", "REFLECTION")),
      ).toThrow(InvalidDialogueTransitionError);
    });

    it("cannot go back to POSITION after advancing to QUESTION", () => {
      const s = makeSession();
      advanceToStep(s, "QUESTION");
      expect(() =>
        s.submitTurn(turn("alice", "POSITION")),
      ).toThrow(InvalidDialogueTransitionError);
    });
  });

  describe("24h Reminder / 48h Expiration", () => {
    it("needsReminder returns true at exactly 24h", () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const s = makeSession({ lastActivityAt: past });
      expect(s.needsReminder(new Date())).toBe(true);
    });

    it("needsReminder returns false before 24h", () => {
      const recent = new Date(Date.now() - 23 * 60 * 60 * 1000);
      const s = makeSession({ lastActivityAt: recent });
      expect(s.needsReminder(new Date())).toBe(false);
    });

    it("needsReminder returns false at 48h (should expire instead)", () => {
      const old = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const s = makeSession({ lastActivityAt: old });
      expect(s.needsReminder(new Date())).toBe(false);
    });

    it("shouldExpire returns true at 48h", () => {
      const old = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const s = makeSession({ lastActivityAt: old });
      expect(s.shouldExpire(new Date())).toBe(true);
    });

    it("shouldExpire returns false before 48h", () => {
      const recent = new Date(Date.now() - 47 * 60 * 60 * 1000);
      const s = makeSession({ lastActivityAt: recent });
      expect(s.shouldExpire(new Date())).toBe(false);
    });

    it("needsReminder returns false for non-ACTIVE session", () => {
      const past = new Date(Date.now() - 25 * 60 * 60 * 1000);
      const s = makeSession({ lastActivityAt: past });
      s.markExpired();
      expect(s.needsReminder(new Date())).toBe(false);
    });

    it("shouldExpire returns false for non-ACTIVE session", () => {
      const old = new Date(Date.now() - 49 * 60 * 60 * 1000);
      const s = makeSession({ lastActivityAt: old });
      s.markExpired();
      expect(s.shouldExpire(new Date())).toBe(false);
    });
  });

  describe("Reconstitution", () => {
    it("reconstitutes session with existing turns", () => {
      const existingTurns = [
        DialogueTurn.create({
          id: "t-1",
          sessionId: "session-1",
          step: "POSITION",
          participantId: "alice",
          content: "My position",
          createdAt: new Date(),
        }),
      ];

      const s = DialogueSession.reconstitute({
        id: "session-1",
        participantA: "alice",
        participantB: "bob",
        currentStep: "POSITION",
        status: "ACTIVE",
        turns: existingTurns,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      });

      expect(s.turns).toHaveLength(1);
      expect(s.hasSubmitted("alice", "POSITION")).toBe(true);
    });
  });
});
