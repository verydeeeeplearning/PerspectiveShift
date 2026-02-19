import { describe, it, expect } from "vitest";
import { ContextualRecommendation } from "../contextual-recommendation";

describe("ContextualRecommendation", () => {
  it("stores recommendation fields", () => {
    const recommendation = new ContextualRecommendation(
      "share_card",
      "유형 카드 공유",
      30,
    );

    expect(recommendation.type).toBe("share_card");
    expect(recommendation.label).toBe("유형 카드 공유");
    expect(recommendation.priority).toBe(30);
  });
});
