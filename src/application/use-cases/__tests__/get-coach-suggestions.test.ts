import { describe, it, expect } from "vitest";
import { GetCoachSuggestionsUseCase } from "../get-coach-suggestions";

describe("GetCoachSuggestionsUseCase", () => {
  const uc = new GetCoachSuggestionsUseCase();

  it("returns 3 suggestions", () => {
    const result = uc.execute();
    expect(result.suggestions).toHaveLength(3);
  });

  it("each suggestion has method, label, and template", () => {
    const result = uc.execute();
    for (const s of result.suggestions) {
      expect(s.method).toBeDefined();
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.template.length).toBeGreaterThan(0);
    }
  });

  it("includes all three method types", () => {
    const result = uc.execute();
    const methods = result.suggestions.map((s) => s.method);
    expect(methods).toContain("POSITION_FIRST");
    expect(methods).toContain("EXPERIENCE_FIRST");
    expect(methods).toContain("QUESTION_FIRST");
  });
});
