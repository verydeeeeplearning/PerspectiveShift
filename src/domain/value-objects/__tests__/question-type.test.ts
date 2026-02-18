import { describe, it, expect } from "vitest";
import { QuestionType } from "../question-type";

describe("QuestionType", () => {
  it("has OX type", () => {
    expect(QuestionType.OX).toBe("OX");
  });

  it("has RUBRIC type", () => {
    expect(QuestionType.RUBRIC).toBe("RUBRIC");
  });

  it("has OPEN_ENDED type", () => {
    expect(QuestionType.OPEN_ENDED).toBe("OPEN_ENDED");
  });

  it("has exactly 3 types", () => {
    expect(Object.keys(QuestionType)).toHaveLength(3);
  });
});
