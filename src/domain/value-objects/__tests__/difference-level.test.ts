import { describe, expect, it } from "vitest";
import { DifferenceLevel } from "../difference-level";

describe("DifferenceLevel", () => {
  it("creates value object for 0~1 range", () => {
    expect(DifferenceLevel.create(0).value).toBe(0);
    expect(DifferenceLevel.create(0.5).value).toBe(0.5);
    expect(DifferenceLevel.create(1).value).toBe(1);
  });

  it("throws when value is out of 0~1 range", () => {
    expect(() => DifferenceLevel.create(-0.01)).toThrow();
    expect(() => DifferenceLevel.create(1.01)).toThrow();
  });

  it("maps to distance range", () => {
    expect(DifferenceLevel.create(0).toDistanceRange()).toEqual({
      min: 0,
      max: 0.2,
    });
    expect(DifferenceLevel.create(0.5).toDistanceRange()).toEqual({
      min: 0.3,
      max: 0.5,
    });
    expect(DifferenceLevel.create(1).toDistanceRange()).toEqual({
      min: 0.8,
      max: 1,
    });
  });

  it("returns human-friendly labels", () => {
    expect(DifferenceLevel.create(0.1).toLabel()).toBe("비슷한 상대");
    expect(DifferenceLevel.create(0.5).toLabel()).toBe("균형 탐색");
    expect(DifferenceLevel.create(0.9).toLabel()).toBe("다른 상대");
  });
});
