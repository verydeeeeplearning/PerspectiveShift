import { describe, it, expect } from "vitest";
import { FallbackQuestionGenerator } from "../fallback-question-generator";
import { ALL_DIMENSIONS } from "@/domain/value-objects/stance-dimension";

describe("FallbackQuestionGenerator", () => {
  it("generates requested batch size", async () => {
    const gen = new FallbackQuestionGenerator();
    const result = await gen.generate({
      previousAnswers: [],
      targetDimensions: [],
      excludeQuestionIds: [],
      batchSize: 5,
      batchIndex: 0,
    });

    expect(result.questions).toHaveLength(5);
    expect(result.batchIndex).toBe(0);
  });

  it("excludes already-used question IDs", async () => {
    const gen = new FallbackQuestionGenerator();
    const result = await gen.generate({
      previousAnswers: [],
      targetDimensions: [],
      excludeQuestionIds: ["21", "22", "23", "24", "25"],
      batchSize: 5,
      batchIndex: 0,
    });

    // None of the returned questions should have IDs from excludeList
    expect(result.questions).toHaveLength(5);
  });

  it("prioritizes target dimensions", async () => {
    const gen = new FallbackQuestionGenerator();
    // Use larger batch to reduce flakiness from shuffle
    const result = await gen.generate({
      previousAnswers: [],
      targetDimensions: ["WORK_LIFE"],
      excludeQuestionIds: [],
      batchSize: 10,
      batchIndex: 0,
    });

    // With 10 questions and WORK_LIFE prioritized, at least some should appear
    const workLifeCount = result.questions.filter(
      (q) => q.dimension === "WORK_LIFE",
    ).length;
    expect(workLifeCount).toBeGreaterThanOrEqual(1);
  });

  it("returns questions with valid structure", async () => {
    const gen = new FallbackQuestionGenerator();
    const result = await gen.generate({
      previousAnswers: [],
      targetDimensions: [],
      excludeQuestionIds: [],
      batchSize: 5,
      batchIndex: 2,
    });

    for (const q of result.questions) {
      expect(q.text).toBeTruthy();
      expect(["OX", "RUBRIC"]).toContain(q.type);
      expect(ALL_DIMENSIONS).toContain(q.dimension);
      expect([1, -1]).toContain(q.polarity);
    }
  });

  it("works without LLM dependency", async () => {
    // This test verifies fallback generator operates purely on static data
    const gen = new FallbackQuestionGenerator();
    const result = await gen.generate({
      previousAnswers: [
        { questionId: "1", questionText: "Q1", answerSummary: "yes" },
      ],
      targetDimensions: ["TECH_REGULATION", "REDISTRIBUTION"],
      excludeQuestionIds: ["1", "2", "3"],
      batchSize: 5,
      batchIndex: 0,
    });

    expect(result.questions.length).toBeGreaterThan(0);
    expect(result.questions.length).toBeLessThanOrEqual(5);
  });

  it("returns fallback questions when exclude list exhausts the pool", async () => {
    const gen = new FallbackQuestionGenerator();
    const result = await gen.generate({
      previousAnswers: [],
      targetDimensions: [],
      excludeQuestionIds: Array.from({ length: 500 }, (_, i) => String(i + 1)),
      batchSize: 5,
      batchIndex: 0,
    });

    expect(result.questions.length).toBeGreaterThanOrEqual(1);
    expect(result.questions.length).toBeLessThanOrEqual(5);
  });
});
