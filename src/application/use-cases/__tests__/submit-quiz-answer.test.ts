import { describe, it, expect } from "vitest";
import { SubmitQuizAnswerAndTextUseCase } from "../submit-quiz-answer";

describe("SubmitQuizAnswerAndTextUseCase", () => {
  const uc = new SubmitQuizAnswerAndTextUseCase();

  it("returns correct feedback when answer matches", () => {
    const result = uc.execute({ selectedIndex: 2, correctIndex: 2, openEndedText: null });
    expect(result.isCorrect).toBe(true);
  });

  it("returns incorrect feedback when answer differs", () => {
    const result = uc.execute({ selectedIndex: 0, correctIndex: 2, openEndedText: null });
    expect(result.isCorrect).toBe(false);
  });

  it("accepts open-ended text after quiz", () => {
    const result = uc.execute({
      selectedIndex: 1,
      correctIndex: 1,
      openEndedText: "상대의 핵심은 이것이에요",
    });
    expect(result.openEndedText).toContain("핵심");
  });

  it("returns shouldPromptOpenEnded true when no text provided", () => {
    const result = uc.execute({ selectedIndex: 0, correctIndex: 1, openEndedText: null });
    expect(result.shouldPromptOpenEnded).toBe(true);
  });
});
