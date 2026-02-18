import { describe, it, expect } from "vitest";
import { KgssBaselineProvider } from "../kgss-baseline-provider";
import { StanceDimension, ALL_DIMENSIONS } from "@/domain/value-objects/stance-dimension";

describe("KgssBaselineProvider", () => {
  const provider = new KgssBaselineProvider();

  describe("getBaseline", () => {
    it("returns baseline data with all 6 dimensions", () => {
      const baseline = provider.getBaseline();
      for (const dim of ALL_DIMENSIONS) {
        expect(baseline.dimensions[dim]).toBeDefined();
        expect(baseline.dimensions[dim].mean).toBeDefined();
        expect(baseline.dimensions[dim].std).toBeGreaterThan(0);
        expect(baseline.dimensions[dim].sampleSize).toBeGreaterThan(0);
      }
    });

    it("returns Korean label", () => {
      const baseline = provider.getBaseline();
      expect(baseline.label).toContain("한국");
    });
  });

  describe("calculatePercentile", () => {
    it("returns ~50 for mean value", () => {
      const baseline = provider.getBaseline();
      const mean = baseline.dimensions.TECH_REGULATION.mean;
      const percentile = provider.calculatePercentile(
        StanceDimension.TECH_REGULATION,
        mean,
      );
      expect(percentile).toBeGreaterThanOrEqual(48);
      expect(percentile).toBeLessThanOrEqual(52);
    });

    it("returns high percentile for value well above mean", () => {
      const percentile = provider.calculatePercentile(
        StanceDimension.TECH_REGULATION,
        0.9,
      );
      expect(percentile).toBeGreaterThan(80);
    });

    it("returns low percentile for value well below mean", () => {
      const percentile = provider.calculatePercentile(
        StanceDimension.TECH_REGULATION,
        -0.9,
      );
      expect(percentile).toBeLessThan(20);
    });

    it("clamps to 1-99 range", () => {
      const low = provider.calculatePercentile(
        StanceDimension.TECH_REGULATION,
        -1.0,
      );
      const high = provider.calculatePercentile(
        StanceDimension.TECH_REGULATION,
        1.0,
      );
      expect(low).toBeGreaterThanOrEqual(1);
      expect(high).toBeLessThanOrEqual(99);
    });

    it("handles all dimensions", () => {
      for (const dim of ALL_DIMENSIONS) {
        const result = provider.calculatePercentile(dim, 0);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(99);
      }
    });
  });
});
