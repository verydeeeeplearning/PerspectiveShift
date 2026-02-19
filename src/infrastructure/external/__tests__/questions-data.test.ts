import { describe, it, expect } from "vitest";
import questionsData from "../data/questions.json";
import { ALL_DIMENSIONS } from "@/domain/value-objects/stance-dimension";

describe("questions.json data", () => {
  it("has exactly 20 questions", () => {
    expect(questionsData).toHaveLength(20);
  });

  it("has unique IDs from 1 to 20", () => {
    const ids = questionsData.map((q) => q.id);
    expect(ids).toEqual([
      1, 2, 3, 4, 5,
      6, 7, 8, 9, 10,
      11, 12, 13, 14, 15,
      16, 17, 18, 19, 20,
    ]);
  });

  it("has 5 core and 15 extended questions", () => {
    const core = questionsData.filter((q) => q.phase === "core");
    const extended = questionsData.filter(
      (q) => q.phase === "extended",
    );
    expect(core).toHaveLength(5);
    expect(extended).toHaveLength(15);
  });

  it("core questions are Q1-Q5", () => {
    const coreIds = questionsData
      .filter((q) => q.phase === "core")
      .map((q) => q.id);
    expect(coreIds).toEqual([1, 2, 3, 4, 5]);
  });

  it("has valid question types", () => {
    const validTypes = ["OX", "RUBRIC", "OPEN_ENDED"];
    for (const q of questionsData) {
      expect(validTypes).toContain(q.type);
    }
  });

  it("has sufficient OX/RUBRIC/OPEN_ENDED mix", () => {
    const ox = questionsData.filter((q) => q.type === "OX");
    const rubric = questionsData.filter((q) => q.type === "RUBRIC");
    const openEnded = questionsData.filter(
      (q) => q.type === "OPEN_ENDED",
    );
    expect(ox.length).toBeGreaterThanOrEqual(7);
    expect(rubric.length).toBeGreaterThanOrEqual(6);
    expect(openEnded.length).toBeGreaterThanOrEqual(4);
  });

  it("maps to valid stance dimensions", () => {
    for (const q of questionsData) {
      expect(ALL_DIMENSIONS).toContain(q.dimension);
    }
  });

  it("has Korean text for all questions", () => {
    for (const q of questionsData) {
      expect(q.text.length).toBeGreaterThan(5);
      expect(/[가-힣]/.test(q.text)).toBe(true);
    }
  });

  it("polarity is 1 or -1", () => {
    for (const q of questionsData) {
      expect([1, -1]).toContain(q.polarity);
    }
  });

  it("open-ended questions include Q9/Q10 and additional depth prompts", () => {
    const openEnded = questionsData.filter(
      (q) => q.type === "OPEN_ENDED",
    );
    expect(openEnded.map((q) => q.id).sort((a, b) => a - b)).toEqual([
      9, 10, 16, 20,
    ]);
  });
});
