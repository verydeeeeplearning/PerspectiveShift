import { describe, it, expect } from "vitest";
import { DialogueReplayCard } from "../dialogue-replay-card";

describe("DialogueReplayCard", () => {
  it("creates with null userThoughtChange", () => {
    const c = DialogueReplayCard.create({
      opponentKeyStatement: "핵심 발언",
      topic: "에너지",
      dialogueId: "d-1",
    });
    expect(c.userThoughtChange).toBeNull();
    expect(c.shouldPromptReMeasurement).toBe(false);
  });

  it("respond sets thought change choice", () => {
    const c = DialogueReplayCard.create({
      opponentKeyStatement: "발언",
      topic: "주제",
      dialogueId: "d-1",
    });
    const responded = c.respond("좀 더 생각하게 됐어요");
    expect(responded.userThoughtChange).toBe("좀 더 생각하게 됐어요");
    expect(responded.shouldPromptReMeasurement).toBe(false);
  });

  it("prompts re-measurement when thought changed", () => {
    const c = DialogueReplayCard.create({
      opponentKeyStatement: "발언",
      topic: "주제",
      dialogueId: "d-1",
    });
    const responded = c.respond("내 생각이 조금 바뀌었어요");
    expect(responded.shouldPromptReMeasurement).toBe(true);
  });
});
