import { describe, it, expect } from "vitest";
import { DialogueFeedback } from "../dialogue-feedback";

describe("DialogueFeedback", () => {
  it("creates with valid satisfaction (1-5)", () => {
    const fb = DialogueFeedback.create({
      id: "fb-1",
      sessionId: "s-1",
      participantId: "p-1",
      satisfaction: 4,
      rematchWillingness: true,
      emotionCheckIn: "hopeful",
      createdAt: new Date(),
    });
    expect(fb.satisfaction).toBe(4);
    expect(fb.rematchWillingness).toBe(true);
  });

  it("throws for satisfaction < 1", () => {
    expect(() =>
      DialogueFeedback.create({
        id: "fb-1",
        sessionId: "s-1",
        participantId: "p-1",
        satisfaction: 0,
        rematchWillingness: false,
        emotionCheckIn: null,
        createdAt: new Date(),
      }),
    ).toThrow();
  });

  it("throws for satisfaction > 5", () => {
    expect(() =>
      DialogueFeedback.create({
        id: "fb-1",
        sessionId: "s-1",
        participantId: "p-1",
        satisfaction: 6,
        rematchWillingness: false,
        emotionCheckIn: null,
        createdAt: new Date(),
      }),
    ).toThrow();
  });

  it("allows null emotionCheckIn", () => {
    const fb = DialogueFeedback.create({
      id: "fb-1",
      sessionId: "s-1",
      participantId: "p-1",
      satisfaction: 3,
      rematchWillingness: false,
      emotionCheckIn: null,
      createdAt: new Date(),
    });
    expect(fb.emotionCheckIn).toBeNull();
  });
});
