import { describe, it, expect } from "vitest";
import { GetExperimentVariantUseCase } from "../get-experiment-variant";

describe("GetExperimentVariantUseCase", () => {
  const uc = new GetExperimentVariantUseCase();

  it("returns deterministic variant for user", () => {
    const input = {
      experimentId: "exp-1", name: "Test", variants: ["A", "B"],
      primaryMetric: "m", guardrailMetric: "g", userId: "u-1",
    };
    const r1 = uc.execute(input);
    const r2 = uc.execute(input);
    expect(r1.variant).toBe(r2.variant);
    expect(["A", "B"]).toContain(r1.variant);
  });
});
