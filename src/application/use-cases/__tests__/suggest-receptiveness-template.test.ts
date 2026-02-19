import { describe, it, expect } from "vitest";
import { SuggestReceptivenessTemplateUseCase } from "../suggest-receptiveness-template";
import type { Facilitator } from "@/domain/interfaces/facilitator";

const mockFacilitator: Facilitator = {
  checkTone: async () => ({ passed: true, suggestion: null, alternatives: [] }),
  checkDrift: async () => ({ drifted: false, suggestion: null }),
  suggestReceptivenessTemplate: async () => [],
  detectReceptiveExpressions: async () => [],
};

describe("SuggestReceptivenessTemplateUseCase", () => {
  const uc = new SuggestReceptivenessTemplateUseCase({ facilitator: mockFacilitator });

  it("returns templates list", async () => {
    const result = await uc.execute();
    expect(result.templates.length).toBeGreaterThan(0);
  });

  it("each template has id, text, and category", async () => {
    const result = await uc.execute();
    for (const t of result.templates) {
      expect(t.id).toBeDefined();
      expect(t.text.length).toBeGreaterThan(0);
      expect(t.category).toBeDefined();
    }
  });

  it("includes multiple categories", async () => {
    const result = await uc.execute();
    const categories = new Set(result.templates.map((t) => t.category));
    expect(categories.size).toBeGreaterThanOrEqual(3);
  });

  it("returns at least 5 templates", async () => {
    const result = await uc.execute();
    expect(result.templates.length).toBeGreaterThanOrEqual(5);
  });

  it("includes detected expressions when opponentText provided", async () => {
    const facilitatorWithDetection: Facilitator = {
      ...mockFacilitator,
      detectReceptiveExpressions: async () => [
        { expression: "그런 관점도 이해해요", suggestedResponse: "저도 이해해요" },
      ],
    };
    const ucWithDetection = new SuggestReceptivenessTemplateUseCase({ facilitator: facilitatorWithDetection });
    const result = await ucWithDetection.execute("상대방 텍스트");
    expect(result.hasDetected).toBe(true);
    expect(result.templates[0].sourceType).toBe("detected");
  });
});
