import { describe, it, expect } from "vitest";
import { DialogueSession } from "../dialogue-session";
import { DialogueTurn } from "../dialogue-turn";
import {
  InvalidDialogueTransitionError,
  DuplicateSubmissionError,
  UnauthorizedParticipantError,
  SessionNotActiveError,
} from "../../errors/domain-errors";

function makeSession() {
  const now = new Date();
  return DialogueSession.create({
    id: "session-1",
    participantA: "alice",
    participantB: "bob",
    currentStep: "POSITION",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  });
}

function makeTurn(
  participantId: string,
  step: "POSITION" | "QUESTION" | "ANSWER" | "REFLECTION",
  content = "test content",
) {
  return DialogueTurn.create({
    id: `turn-${participantId}-${step}`,
    sessionId: "session-1",
    step,
    participantId,
    content,
    createdAt: new Date(),
  });
}

describe("DialogueSession", () => {
  it("creates session with ACTIVE status and POSITION step", () => {
    const s = makeSession();
    expect(s.status).toBe("ACTIVE");
    expect(s.currentStep).toBe("POSITION");
    expect(s.turns).toHaveLength(0);
  });

  it("isParticipant identifies valid participants", () => {
    const s = makeSession();
    expect(s.isParticipant("alice")).toBe(true);
    expect(s.isParticipant("bob")).toBe(true);
    expect(s.isParticipant("eve")).toBe(false);
  });

  it("submits turn and stays on step until both submit", () => {
    const s = makeSession();
    s.submitTurn(makeTurn("alice", "POSITION"));
    expect(s.currentStep).toBe("POSITION");
    expect(s.turns).toHaveLength(1);
  });

  it("advances to next step when both submit", () => {
    const s = makeSession();
    s.submitTurn(makeTurn("alice", "POSITION"));
    s.submitTurn(makeTurn("bob", "POSITION"));
    expect(s.currentStep).toBe("QUESTION");
  });

  it("throws DuplicateSubmissionError for same participant same step", () => {
    const s = makeSession();
    s.submitTurn(makeTurn("alice", "POSITION"));
    expect(() => s.submitTurn(makeTurn("alice", "POSITION"))).toThrow(
      DuplicateSubmissionError,
    );
  });

  it("throws UnauthorizedParticipantError for non-participant", () => {
    const s = makeSession();
    expect(() => s.submitTurn(makeTurn("eve", "POSITION"))).toThrow(
      UnauthorizedParticipantError,
    );
  });

  it("throws InvalidDialogueTransitionError for wrong step", () => {
    const s = makeSession();
    expect(() => s.submitTurn(makeTurn("alice", "QUESTION"))).toThrow(
      InvalidDialogueTransitionError,
    );
  });

  it("throws SessionNotActiveError for expired session", () => {
    const s = makeSession();
    s.markExpired();
    expect(() => s.submitTurn(makeTurn("alice", "POSITION"))).toThrow(
      SessionNotActiveError,
    );
  });

  it("completes session after REFLECTION by both", () => {
    const s = makeSession();
    s.submitTurn(makeTurn("alice", "POSITION"));
    s.submitTurn(makeTurn("bob", "POSITION"));
    s.submitTurn(makeTurn("alice", "QUESTION"));
    s.submitTurn(makeTurn("bob", "QUESTION"));
    s.submitTurn(makeTurn("alice", "ANSWER"));
    s.submitTurn(makeTurn("bob", "ANSWER"));
    s.submitTurn(makeTurn("alice", "REFLECTION"));
    s.submitTurn(makeTurn("bob", "REFLECTION"));
    expect(s.status).toBe("COMPLETED");
    expect(s.isComplete()).toBe(true);
  });

  it("cancel changes status", () => {
    const s = makeSession();
    s.cancel();
    expect(s.status).toBe("CANCELLED");
  });

  it("cancel throws if not active", () => {
    const s = makeSession();
    s.cancel();
    expect(() => s.cancel()).toThrow(SessionNotActiveError);
  });

  it("turnsForStep returns correct turns", () => {
    const s = makeSession();
    s.submitTurn(makeTurn("alice", "POSITION", "alice pos"));
    s.submitTurn(makeTurn("bob", "POSITION", "bob pos"));
    const turns = s.turnsForStep("POSITION");
    expect(turns).toHaveLength(2);
  });

  it("hasSubmitted tracks correctly", () => {
    const s = makeSession();
    expect(s.hasSubmitted("alice", "POSITION")).toBe(false);
    s.submitTurn(makeTurn("alice", "POSITION"));
    expect(s.hasSubmitted("alice", "POSITION")).toBe(true);
    expect(s.hasSubmitted("bob", "POSITION")).toBe(false);
  });
});
