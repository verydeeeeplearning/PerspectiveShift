import { describe, it, expect } from "vitest";
import { SuggestReceptivenessTemplateUseCase } from "../suggest-receptiveness-template";

describe("SuggestReceptivenessTemplateUseCase", () => {
  const uc = new SuggestReceptivenessTemplateUseCase();

  it("returns templates list", () => {
    const result = uc.execute();
    expect(result.templates.length).toBeGreaterThan(0);
  });

  it("each template has id, text, and category", () => {
    const result = uc.execute();
    for (const t of result.templates) {
      expect(t.id).toBeDefined();
      expect(t.text.length).toBeGreaterThan(0);
      expect(t.category).toBeDefined();
    }
  });

  it("includes multiple categories", () => {
    const result = uc.execute();
    const categories = new Set(result.templates.map((t) => t.category));
    expect(categories.size).toBeGreaterThanOrEqual(3);
  });

  it("returns at least 5 templates", () => {
    const result = uc.execute();
    expect(result.templates.length).toBeGreaterThanOrEqual(5);
  });
});
