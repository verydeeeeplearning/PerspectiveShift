import { describe, it, expect } from "vitest";
import { FallbackLlmEvaluator } from "../llm-evaluator";

describe("LLM Evaluator", () => {
  it("evaluates receptiveness language ratio", async () => {
    const evaluator = new FallbackLlmEvaluator();
    const result = await evaluator.evaluate([
      "네 말에 일리가 있어", // receptive
      "그건 완전 틀렸어", // not receptive
      "그 점은 동의해",  // receptive
    ]);
    expect(result.receptivenessRatio).toBeDefined();
    expect(result.receptivenessRatio).toBeGreaterThanOrEqual(0);
    expect(result.receptivenessRatio).toBeLessThanOrEqual(1);
  });

  it("evaluates personal attack frequency", async () => {
    const evaluator = new FallbackLlmEvaluator();
    const result = await evaluator.evaluate([
      "너는 무식해서 그런 말을 하는 거야", // attack
      "그 의견에는 동의하지 않아",
    ]);
    expect(result.personalAttackFrequency).toBeDefined();
  });

  it("returns all 4 metrics", async () => {
    const evaluator = new FallbackLlmEvaluator();
    const result = await evaluator.evaluate(["테스트 대화"]);
    expect(result).toHaveProperty("receptivenessRatio");
    expect(result).toHaveProperty("summaryAccuracy");
    expect(result).toHaveProperty("personalAttackFrequency");
    expect(result).toHaveProperty("topicDriftFrequency");
  });
});
