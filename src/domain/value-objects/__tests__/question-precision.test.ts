import { describe, it, expect } from "vitest";
import { QUESTION_PRECISION_CONFIG } from "../question-precision";

describe("QUESTION_PRECISION_CONFIG", () => {
  it("defines quick/standard/detailed precisions", () => {
    expect(QUESTION_PRECISION_CONFIG.quick.totalQuestions).toBe(5);
    expect(QUESTION_PRECISION_CONFIG.standard.totalQuestions).toBe(10);
    expect(QUESTION_PRECISION_CONFIG.detailed.totalQuestions).toBe(20);
  });

  it("includes estimated time and labels", () => {
    expect(QUESTION_PRECISION_CONFIG.quick.estimatedMinutes).toBeGreaterThan(0);
    expect(QUESTION_PRECISION_CONFIG.standard.label).toBe("표준 분석");
  });
});
