import { describe, it, expect } from "vitest";
import { HandleThoughtChangeUseCase } from "../handle-thought-change";

describe("HandleThoughtChangeUseCase", () => {
  const uc = new HandleThoughtChangeUseCase();

  it("returns no re-measurement for thinking more", () => {
    const r = uc.execute({
      opponentKeyStatement: "발언", topic: "주제", dialogueId: "d-1",
      choice: "좀 더 생각하게 됐어요",
    });
    expect(r.shouldPromptReMeasurement).toBe(false);
  });

  it("prompts re-measurement for thought change", () => {
    const r = uc.execute({
      opponentKeyStatement: "발언", topic: "주제", dialogueId: "d-1",
      choice: "내 생각이 조금 바뀌었어요",
    });
    expect(r.shouldPromptReMeasurement).toBe(true);
  });
});
