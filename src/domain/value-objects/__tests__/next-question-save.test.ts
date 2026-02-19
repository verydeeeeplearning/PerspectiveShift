import { describe, it, expect } from "vitest";
import { NextQuestionSave } from "../next-question-save";

describe("NextQuestionSave", () => {
  it("creates with valid text and dialogueId", () => {
    const nq = NextQuestionSave.create({
      questionText: "상대방의 경험이 궁금해요",
      linkedToDialogueId: "d-1",
    });
    expect(nq.questionText).toBe("상대방의 경험이 궁금해요");
    expect(nq.linkedToDialogueId).toBe("d-1");
  });

  it("trims whitespace", () => {
    const nq = NextQuestionSave.create({
      questionText: "  다음에 물어볼 질문  ",
      linkedToDialogueId: "d-2",
    });
    expect(nq.questionText).toBe("다음에 물어볼 질문");
  });

  it("throws on empty text", () => {
    expect(() =>
      NextQuestionSave.create({ questionText: "  ", linkedToDialogueId: "d-1" }),
    ).toThrow("questionText must not be empty");
  });

  it("throws on text over 200 chars", () => {
    expect(() =>
      NextQuestionSave.create({
        questionText: "a".repeat(201),
        linkedToDialogueId: "d-1",
      }),
    ).toThrow("questionText must be 200 chars or less");
  });
});
