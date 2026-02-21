import { describe, it, expect } from "vitest";
import { QUESTION_PRECISION_CONFIG } from "../question-precision";

describe("QUESTION_PRECISION_CONFIG", () => {
  it("defines lite/standard/deep/comprehensive precisions", () => {
    expect(QUESTION_PRECISION_CONFIG.lite.totalQuestions).toBe(10);
    expect(QUESTION_PRECISION_CONFIG.standard.totalQuestions).toBe(20);
    expect(QUESTION_PRECISION_CONFIG.deep.totalQuestions).toBe(30);
    expect(QUESTION_PRECISION_CONFIG.comprehensive.totalQuestions).toBe(50);
  });

  it("includes estimated time and labels", () => {
    expect(QUESTION_PRECISION_CONFIG.lite.estimatedMinutes).toBeGreaterThan(0);
    expect(QUESTION_PRECISION_CONFIG.standard.label).toBe("표준 분석");
  });
});
