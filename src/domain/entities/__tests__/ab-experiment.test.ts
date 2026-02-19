import { describe, it, expect } from "vitest";
import { ABExperiment } from "../ab-experiment";

describe("ABExperiment", () => {
  it("creates experiment with variants", () => {
    const e = ABExperiment.create({
      experimentId: "exp-1", name: "Button Color",
      variants: ["control", "blue", "green"],
      primaryMetric: "click_rate", guardrailMetric: "bounce_rate",
    });
    expect(e.variants.length).toBe(3);
  });

  it("throws with fewer than 2 variants", () => {
    expect(() => ABExperiment.create({
      experimentId: "exp-2", name: "One",
      variants: ["only"], primaryMetric: "m", guardrailMetric: "g",
    })).toThrow("Must have at least 2 variants");
  });

  it("assigns deterministic variant for same userId", () => {
    const e = ABExperiment.create({
      experimentId: "exp-3", name: "Test",
      variants: ["A", "B"], primaryMetric: "m", guardrailMetric: "g",
    });
    const v1 = e.assignVariant("user-123");
    const v2 = e.assignVariant("user-123");
    expect(v1).toBe(v2);
  });

  it("assigns different variants for different users", () => {
    const e = ABExperiment.create({
      experimentId: "exp-4", name: "Test",
      variants: ["A", "B"], primaryMetric: "m", guardrailMetric: "g",
    });
    const results = new Set(Array.from({ length: 100 }, (_, i) => e.assignVariant(`user-${i}`)));
    expect(results.size).toBe(2);
  });
});
