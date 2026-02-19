import { describe, it, expect } from "vitest";
import {
  CoachSuggestion,
  COACH_METHODS,
  type CoachMethodKey,
} from "../coach-suggestion";

describe("CoachSuggestion", () => {
  it("returns 3 coach methods", () => {
    const suggestions = CoachSuggestion.all();
    expect(suggestions).toHaveLength(3);
  });

  it("includes POSITION_FIRST method", () => {
    const suggestions = CoachSuggestion.all();
    const posFirst = suggestions.find((s) => s.method === "POSITION_FIRST");
    expect(posFirst).toBeDefined();
    expect(posFirst!.template.length).toBeGreaterThan(0);
    expect(posFirst!.label.length).toBeGreaterThan(0);
  });

  it("includes EXPERIENCE_FIRST method", () => {
    const suggestions = CoachSuggestion.all();
    const expFirst = suggestions.find((s) => s.method === "EXPERIENCE_FIRST");
    expect(expFirst).toBeDefined();
    expect(expFirst!.template).toContain("경험");
  });

  it("includes QUESTION_FIRST method", () => {
    const suggestions = CoachSuggestion.all();
    const qFirst = suggestions.find((s) => s.method === "QUESTION_FIRST");
    expect(qFirst).toBeDefined();
    expect(qFirst!.template).toContain("?");
  });

  it("creates a single suggestion by method key", () => {
    const suggestion = CoachSuggestion.forMethod("POSITION_FIRST");
    expect(suggestion.method).toBe("POSITION_FIRST");
    expect(suggestion.template.length).toBeGreaterThan(0);
  });

  it("COACH_METHODS constant has 3 entries", () => {
    expect(COACH_METHODS).toHaveLength(3);
  });

  it("each suggestion has distinct method key", () => {
    const suggestions = CoachSuggestion.all();
    const methods = suggestions.map((s) => s.method);
    expect(new Set(methods).size).toBe(3);
  });

  it("throws for invalid method key", () => {
    expect(() => CoachSuggestion.forMethod("INVALID" as CoachMethodKey)).toThrow();
  });
});
