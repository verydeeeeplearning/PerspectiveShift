import { describe, it, expect } from "vitest";
import expandedQuestions from "../data/expanded-questions.json";
import { ALL_DIMENSIONS } from "@/domain/value-objects/stance-dimension";

describe("expanded-questions.json", () => {
  it("contains 30 questions (IDs 21-50)", () => {
    expect(expandedQuestions).toHaveLength(30);
  });

  it("all questions have valid structure", () => {
    for (const q of expandedQuestions) {
      expect(q.id).toBeGreaterThanOrEqual(21);
      expect(q.id).toBeLessThanOrEqual(50);
      expect(q.text).toBeTruthy();
      expect(["OX", "RUBRIC"]).toContain(q.type);
      expect(ALL_DIMENSIONS).toContain(q.dimension);
      expect([1, -1]).toContain(q.polarity);
    }
  });

  it("covers all 6 dimensions", () => {
    const dimensions = new Set(expandedQuestions.map((q) => q.dimension));
    for (const dim of ALL_DIMENSIONS) {
      expect(dimensions.has(dim)).toBe(true);
    }
  });

  it("has a mix of OX and RUBRIC types", () => {
    const types = new Set(expandedQuestions.map((q) => q.type));
    expect(types.has("OX")).toBe(true);
    expect(types.has("RUBRIC")).toBe(true);
  });

  it("each dimension has at least 4 questions", () => {
    const dimCounts: Record<string, number> = {};
    for (const q of expandedQuestions) {
      dimCounts[q.dimension] = (dimCounts[q.dimension] || 0) + 1;
    }
    for (const dim of ALL_DIMENSIONS) {
      expect(dimCounts[dim] || 0).toBeGreaterThanOrEqual(4);
    }
  });

  it("has no duplicate IDs", () => {
    const ids = expandedQuestions.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
