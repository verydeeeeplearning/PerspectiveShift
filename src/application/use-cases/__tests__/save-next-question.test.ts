import { describe, it, expect } from "vitest";
import { SaveNextQuestionUseCase } from "../save-next-question";

describe("SaveNextQuestionUseCase", () => {
  const uc = new SaveNextQuestionUseCase();

  it("saves next question with trimming", () => {
    const result = uc.execute({
      questionText: "  다음에 물어볼 질문  ",
      linkedToDialogueId: "d-1",
    });
    expect(result.questionText).toBe("다음에 물어볼 질문");
    expect(result.linkedToDialogueId).toBe("d-1");
  });

  it("throws on empty text", () => {
    expect(() =>
      uc.execute({ questionText: "", linkedToDialogueId: "d-1" }),
    ).toThrow();
  });

  it("throws on text over 200 chars", () => {
    expect(() =>
      uc.execute({ questionText: "a".repeat(201), linkedToDialogueId: "d-1" }),
    ).toThrow();
  });
});
