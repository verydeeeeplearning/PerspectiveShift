import { describe, it, expect } from "vitest";
import { OpinionDistance } from "../opinion-distance";
import { InvalidOpinionDistanceError } from "../../errors/domain-errors";

describe("OpinionDistance", () => {
  it("creates valid distance", () => {
    const d = OpinionDistance.create(0.5);
    expect(d.value).toBe(0.5);
  });

  it("normalizes to 3 decimal places", () => {
    const d = OpinionDistance.create(0.55555);
    expect(d.value).toBe(0.556);
  });

  it("throws for negative value", () => {
    expect(() => OpinionDistance.create(-0.1)).toThrow(
      InvalidOpinionDistanceError,
    );
  });

  it("throws for value > 2", () => {
    expect(() => OpinionDistance.create(2.1)).toThrow(
      InvalidOpinionDistanceError,
    );
  });

  it("accepts boundary values", () => {
    expect(OpinionDistance.create(0).value).toBe(0);
    expect(OpinionDistance.create(2).value).toBe(2);
  });

  it("isInSweetSpot returns true for [0.4, 0.7]", () => {
    expect(OpinionDistance.create(0.4).isInSweetSpot()).toBe(true);
    expect(OpinionDistance.create(0.55).isInSweetSpot()).toBe(true);
    expect(OpinionDistance.create(0.7).isInSweetSpot()).toBe(true);
  });

  it("isInSweetSpot returns false outside range", () => {
    expect(OpinionDistance.create(0.39).isInSweetSpot()).toBe(false);
    expect(OpinionDistance.create(0.71).isInSweetSpot()).toBe(false);
  });

  it("isTooClose for values below 0.4", () => {
    expect(OpinionDistance.create(0.1).isTooClose()).toBe(true);
    expect(OpinionDistance.create(0.5).isTooClose()).toBe(false);
  });

  it("isTooFar for values above 0.7", () => {
    expect(OpinionDistance.create(1.5).isTooFar()).toBe(true);
    expect(OpinionDistance.create(0.5).isTooFar()).toBe(false);
  });

  it("equals compares values", () => {
    const a = OpinionDistance.create(0.5);
    const b = OpinionDistance.create(0.5);
    expect(a.equals(b)).toBe(true);
  });
});
