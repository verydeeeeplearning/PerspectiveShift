import { describe, it, expect } from "vitest";
import {
  ALL_DIMENSIONS,
  DIMENSION_LABELS,
  DIMENSION_POLES,
} from "../stance-dimension";

describe("StanceDimension", () => {
  it("has 6 dimensions", () => {
    expect(ALL_DIMENSIONS).toHaveLength(6);
  });

  it("includes all expected dimensions", () => {
    expect(ALL_DIMENSIONS).toContain("TECH_REGULATION");
    expect(ALL_DIMENSIONS).toContain("REDISTRIBUTION");
    expect(ALL_DIMENSIONS).toContain("WORK_LIFE");
    expect(ALL_DIMENSIONS).toContain("MERITOCRACY");
    expect(ALL_DIMENSIONS).toContain("TECH_OPTIMISM");
    expect(ALL_DIMENSIONS).toContain("OPPORTUNITY_EQUALITY");
  });

  it("has Korean labels for all dimensions", () => {
    for (const dim of ALL_DIMENSIONS) {
      expect(DIMENSION_LABELS[dim]).toBeDefined();
      expect(typeof DIMENSION_LABELS[dim]).toBe("string");
    }
  });

  it("has poles (low/high) for all dimensions", () => {
    for (const dim of ALL_DIMENSIONS) {
      expect(DIMENSION_POLES[dim]).toBeDefined();
      expect(DIMENSION_POLES[dim].low).toBeDefined();
      expect(DIMENSION_POLES[dim].high).toBeDefined();
    }
  });
});
