import { describe, it, expect } from "vitest";
import {
  DistanceBand,
  STANDARD_BANDS,
} from "../distance-band";

describe("DistanceBand", () => {
  it("creates with min/max", () => {
    const band = DistanceBand.create(0.2, 0.4);
    expect(band.min).toBe(0.2);
    expect(band.max).toBe(0.4);
  });

  it("contains distance within range", () => {
    const band = DistanceBand.create(0.3, 0.6);
    expect(band.contains(0.4)).toBe(true);
    expect(band.contains(0.3)).toBe(true);
    expect(band.contains(0.6)).toBe(true);
    expect(band.contains(0.2)).toBe(false);
    expect(band.contains(0.7)).toBe(false);
  });

  it("throws if min >= max", () => {
    expect(() => DistanceBand.create(0.5, 0.3)).toThrow();
    expect(() => DistanceBand.create(0.5, 0.5)).toThrow();
  });

  it("throws if values out of range", () => {
    expect(() => DistanceBand.create(-0.1, 0.5)).toThrow();
    expect(() => DistanceBand.create(0.1, 2.5)).toThrow();
  });

  it("has LOW standard band (0.2-0.4)", () => {
    expect(STANDARD_BANDS.LOW.min).toBe(0.2);
    expect(STANDARD_BANDS.LOW.max).toBe(0.4);
  });

  it("has MEDIUM standard band (0.3-0.6)", () => {
    expect(STANDARD_BANDS.MEDIUM.min).toBe(0.3);
    expect(STANDARD_BANDS.MEDIUM.max).toBe(0.6);
  });

  it("has HIGH standard band (0.4-0.8)", () => {
    expect(STANDARD_BANDS.HIGH.min).toBe(0.4);
    expect(STANDARD_BANDS.HIGH.max).toBe(0.8);
  });

  it("label returns correct description", () => {
    const band = DistanceBand.create(0.2, 0.4);
    expect(band.label).toBe("LOW");
  });
});
