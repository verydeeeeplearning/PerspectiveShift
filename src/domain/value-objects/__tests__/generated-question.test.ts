import { describe, it, expect } from "vitest";
import { GeneratedQuestion, InvalidGeneratedQuestionError } from "../generated-question";

describe("GeneratedQuestion", () => {
  it("creates with valid props", () => {
    const q = GeneratedQuestion.create({
      index: 0,
      batchIndex: 1,
      text: "AI 기술이 사회에 미치는 영향은?",
      type: "RUBRIC",
      dimension: "TECH_REGULATION",
      polarity: 1,
    });

    expect(q.id).toBe("gen-1-0");
    expect(q.text).toBe("AI 기술이 사회에 미치는 영향은?");
    expect(q.type).toBe("RUBRIC");
    expect(q.dimension).toBe("TECH_REGULATION");
    expect(q.polarity).toBe(1);
    expect(q.batchIndex).toBe(1);
  });

  it("generates unique IDs based on batch and index", () => {
    const q1 = GeneratedQuestion.create({
      index: 0, batchIndex: 0, text: "Q1", type: "OX", dimension: "TECH_REGULATION", polarity: 1,
    });
    const q2 = GeneratedQuestion.create({
      index: 1, batchIndex: 0, text: "Q2", type: "OX", dimension: "REDISTRIBUTION", polarity: -1,
    });
    const q3 = GeneratedQuestion.create({
      index: 0, batchIndex: 1, text: "Q3", type: "RUBRIC", dimension: "WORK_LIFE", polarity: 1,
    });

    expect(q1.id).toBe("gen-0-0");
    expect(q2.id).toBe("gen-0-1");
    expect(q3.id).toBe("gen-1-0");
  });

  it("throws for empty text", () => {
    expect(() =>
      GeneratedQuestion.create({
        index: 0, batchIndex: 0, text: "", type: "OX", dimension: "TECH_REGULATION", polarity: 1,
      }),
    ).toThrow(InvalidGeneratedQuestionError);
  });

  it("throws for whitespace-only text", () => {
    expect(() =>
      GeneratedQuestion.create({
        index: 0, batchIndex: 0, text: "   ", type: "OX", dimension: "TECH_REGULATION", polarity: 1,
      }),
    ).toThrow(InvalidGeneratedQuestionError);
  });

  it("throws for negative batchIndex", () => {
    expect(() =>
      GeneratedQuestion.create({
        index: 0, batchIndex: -1, text: "Valid text", type: "OX", dimension: "TECH_REGULATION", polarity: 1,
      }),
    ).toThrow(InvalidGeneratedQuestionError);
  });

  it("throws for negative index", () => {
    expect(() =>
      GeneratedQuestion.create({
        index: -1, batchIndex: 0, text: "Valid text", type: "OX", dimension: "TECH_REGULATION", polarity: 1,
      }),
    ).toThrow(InvalidGeneratedQuestionError);
  });

  it("throws for non-integer batchIndex", () => {
    expect(() =>
      GeneratedQuestion.create({
        index: 0, batchIndex: 1.5, text: "Valid text", type: "OX", dimension: "TECH_REGULATION", polarity: 1,
      }),
    ).toThrow(InvalidGeneratedQuestionError);
  });
});
