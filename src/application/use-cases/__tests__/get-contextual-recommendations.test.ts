import { describe, it, expect } from "vitest";
import { GetContextualRecommendationsUseCase } from "../get-contextual-recommendations";

describe("GetContextualRecommendationsUseCase", () => {
  it("returns precision upsell when low precision", () => {
    const uc = new GetContextualRecommendationsUseCase();
    const result = uc.execute({
      isLowPrecision: true,
      hasHumanMatchPool: true,
      hasMisperceptionTarget: false,
    });

    expect(result.some((item) => item.type === "precision_upsell")).toBe(true);
  });

  it("returns ai practice when human pool is not available", () => {
    const uc = new GetContextualRecommendationsUseCase();
    const result = uc.execute({
      isLowPrecision: false,
      hasHumanMatchPool: false,
      hasMisperceptionTarget: false,
    });

    expect(result.some((item) => item.type === "ai_practice")).toBe(true);
  });

  it("always includes share card recommendation", () => {
    const uc = new GetContextualRecommendationsUseCase();
    const result = uc.execute({
      isLowPrecision: false,
      hasHumanMatchPool: true,
      hasMisperceptionTarget: false,
    });

    expect(result.at(-1)?.type).toBe("share_card");
  });

  it("sorts recommendations by priority desc", () => {
    const uc = new GetContextualRecommendationsUseCase();
    const result = uc.execute({
      isLowPrecision: true,
      hasHumanMatchPool: false,
      hasMisperceptionTarget: true,
    });

    const priorities = result.map((item) => item.priority);
    expect(priorities).toEqual([...priorities].sort((a, b) => b - a));
  });
});
