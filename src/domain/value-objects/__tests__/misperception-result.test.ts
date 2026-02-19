import { describe, it, expect } from "vitest";
import { MisperceptionResult } from "../misperception-result";

describe("MisperceptionResult", () => {
  it("creates with correct gap calculation", () => {
    const result = MisperceptionResult.create(
      "TECH_REGULATION",
      0.7,
      0.3,
    );
    expect(result.dimension).toBe("TECH_REGULATION");
    expect(result.userPrediction).toBe(0.7);
    expect(result.actualBaseline).toBe(0.3);
    expect(result.gap).toBeCloseTo(0.4);
  });

  it("calculates gap percentage", () => {
    const result = MisperceptionResult.create(
      "REDISTRIBUTION",
      0.8,
      0.2,
    );
    expect(result.gapPercentage).toBe(30); // 0.6 * 50 = 30
  });

  it("isAccurate is true when gap < threshold", () => {
    const result = MisperceptionResult.create(
      "MERITOCRACY",
      0.5,
      0.55,
    );
    expect(result.gap).toBeCloseTo(0.05);
    expect(result.isAccurate).toBe(true);
  });

  it("isAccurate is false when gap >= threshold", () => {
    const result = MisperceptionResult.create(
      "WORK_LIFE",
      0.7,
      0.2,
    );
    expect(result.gap).toBeCloseTo(0.5);
    expect(result.isAccurate).toBe(false);
  });

  it("clamps values to [-1, 1]", () => {
    const result = MisperceptionResult.create(
      "TECH_OPTIMISM",
      1.5,
      -1.5,
    );
    expect(result.userPrediction).toBe(1);
    expect(result.actualBaseline).toBe(-1);
  });
});
