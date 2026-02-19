import { describe, it, expect } from "vitest";
import { DialogueFeedback } from "../dialogue-feedback";

function makeFeedback(overrides: Partial<{
  satisfaction: number;
  feelHeardScore: number;
  affectiveWarmth: number;
  emotionCheckIn: string | null;
}> = {}) {
  return DialogueFeedback.create({
    id: "fb-1",
    sessionId: "s-1",
    participantId: "p-1",
    satisfaction: overrides.satisfaction ?? 4,
    feelHeardScore: overrides.feelHeardScore ?? 3,
    affectiveWarmth: overrides.affectiveWarmth ?? 5,
    rematchWillingness: true,
    emotionCheckIn: "emotionCheckIn" in overrides ? overrides.emotionCheckIn! : "hopeful",
    createdAt: new Date(),
  });
}

describe("DialogueFeedback", () => {
  it("creates with valid satisfaction (1-5)", () => {
    const fb = makeFeedback();
    expect(fb.satisfaction).toBe(4);
    expect(fb.rematchWillingness).toBe(true);
  });

  it("creates with feelHeardScore and affectiveWarmth", () => {
    const fb = makeFeedback({ feelHeardScore: 5, affectiveWarmth: 8 });
    expect(fb.feelHeardScore).toBe(5);
    expect(fb.affectiveWarmth).toBe(8);
  });

  it("throws for satisfaction < 1", () => {
    expect(() => makeFeedback({ satisfaction: 0 })).toThrow();
  });

  it("throws for satisfaction > 5", () => {
    expect(() => makeFeedback({ satisfaction: 6 })).toThrow();
  });

  it("throws for feelHeardScore < 1", () => {
    expect(() => makeFeedback({ feelHeardScore: 0 })).toThrow();
  });

  it("throws for feelHeardScore > 5", () => {
    expect(() => makeFeedback({ feelHeardScore: 6 })).toThrow();
  });

  it("throws for affectiveWarmth < 0", () => {
    expect(() => makeFeedback({ affectiveWarmth: -1 })).toThrow();
  });

  it("throws for affectiveWarmth > 10", () => {
    expect(() => makeFeedback({ affectiveWarmth: 11 })).toThrow();
  });

  it("allows null emotionCheckIn", () => {
    const fb = makeFeedback({ emotionCheckIn: null });
    expect(fb.emotionCheckIn).toBeNull();
  });
});
