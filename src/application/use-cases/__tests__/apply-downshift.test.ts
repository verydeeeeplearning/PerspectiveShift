import { describe, it, expect } from "vitest";
import { ApplyDownshiftUseCase } from "../apply-downshift";

describe("ApplyDownshiftUseCase", () => {
  const uc = new ApplyDownshiftUseCase();

  it("applies downshift action to matching params", () => {
    const result = uc.execute(
      [{ type: "downshift", reason: "low_energy" }],
      {
        topicLevel: 2,
        distanceBandMin: 0.3,
        distanceBandMax: 0.5,
        facilitatorIntensity: 0.8,
      },
    );

    expect(result.topicLevel).toBe(1);
    expect(result.distanceBandMin).toBeCloseTo(0.2);
    expect(result.distanceBandMax).toBe(0.35);
    expect(result.facilitatorIntensity).toBe(1);
  });

  it("applies recovery action to safe defaults", () => {
    const result = uc.execute(
      [{ type: "break_suggest", reason: "distress" }],
      {
        topicLevel: 3,
        distanceBandMin: 0.6,
        distanceBandMax: 0.8,
        facilitatorIntensity: 0.6,
      },
    );

    expect(result.topicLevel).toBe(2);
    expect(result.distanceBandMin).toBe(0.2);
    expect(result.distanceBandMax).toBe(0.3);
    expect(result.facilitatorIntensity).toBe(1);
  });

  it("clamps values when already at lower bounds", () => {
    const result = uc.execute(
      [{ type: "downshift", reason: "low_energy" }],
      {
        topicLevel: 0,
        distanceBandMin: 0.01,
        distanceBandMax: 0.2,
        facilitatorIntensity: 1.2,
      },
    );

    expect(result.topicLevel).toBe(0);
    expect(result.distanceBandMin).toBe(0.15);
    expect(result.distanceBandMax).toBe(0.2);
    expect(result.facilitatorIntensity).toBe(1.2);
  });
});
