import { describe, it, expect } from "vitest";
import { DialogueTurn } from "../dialogue-turn";

describe("DialogueTurn", () => {
  it("creates turn with all properties", () => {
    const now = new Date();
    const turn = DialogueTurn.create({
      id: "turn-1",
      sessionId: "session-1",
      step: "POSITION",
      participantId: "participant-a",
      content: "My position is...",
      createdAt: now,
    });

    expect(turn.id).toBe("turn-1");
    expect(turn.sessionId).toBe("session-1");
    expect(turn.step).toBe("POSITION");
    expect(turn.participantId).toBe("participant-a");
    expect(turn.content).toBe("My position is...");
    expect(turn.createdAt).toBe(now);
  });
});
