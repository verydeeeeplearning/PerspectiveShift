import { describe, it, expect } from "vitest";
import { DemographicBaselineProvider } from "../demographic-baseline-provider";
import { ALL_DIMENSIONS, StanceDimension } from "@/domain/value-objects/stance-dimension";

describe("DemographicBaselineProvider", () => {
  describe("exact match", () => {
    it("finds 30대 IT·테크 group", () => {
      const provider = new DemographicBaselineProvider("30대", "IT·테크");
      const baseline = provider.getBaseline();
      expect(baseline.label).toBe("30대 · IT·테크 대비");
      for (const dim of ALL_DIMENSIONS) {
        expect(baseline.dimensions[dim].mean).toBeDefined();
        expect(baseline.dimensions[dim].std).toBeGreaterThan(0);
      }
    });
  });

  describe("UI category mapping", () => {
    it("maps IT/개발 to IT·테크", () => {
      const provider = new DemographicBaselineProvider("20대", "IT/개발");
      const baseline = provider.getBaseline();
      expect(baseline.label).toBe("20대 · IT/개발 대비");
      // Should resolve to a valid group, not fallback
      expect(baseline.dimensions.TECH_OPTIMISM.mean).not.toBe(0);
    });

    it("maps 60대 이상 to 60대", () => {
      const provider = new DemographicBaselineProvider("60대 이상", "학생");
      const baseline = provider.getBaseline();
      expect(baseline.label).toBe("60대 이상 · 학생 대비");
    });
  });

  describe("fallback hierarchy", () => {
    it("falls back to age-only when job not found", () => {
      const provider = new DemographicBaselineProvider("30대", "우주비행사");
      const baseline = provider.getBaseline();
      // Should fallback to 30대 전체
      for (const dim of ALL_DIMENSIONS) {
        expect(baseline.dimensions[dim].mean).toBeDefined();
      }
    });

    it("falls back to overall when nothing matches", () => {
      const provider = new DemographicBaselineProvider("200대", "우주비행사");
      const baseline = provider.getBaseline();
      // Should fallback to 전체 × 전체
      for (const dim of ALL_DIMENSIONS) {
        expect(baseline.dimensions[dim].mean).toBeDefined();
      }
    });

    it("uses overall when no demographic provided", () => {
      const provider = new DemographicBaselineProvider();
      const baseline = provider.getBaseline();
      expect(baseline.label).toBe("전체 응답자 대비");
    });
  });

  describe("calculatePercentile", () => {
    const provider = new DemographicBaselineProvider("30대", "IT·테크");

    it("returns ~50 for the group mean", () => {
      const baseline = provider.getBaseline();
      const mean = baseline.dimensions.TECH_REGULATION.mean;
      const p = provider.calculatePercentile(StanceDimension.TECH_REGULATION, mean);
      expect(p).toBeGreaterThanOrEqual(48);
      expect(p).toBeLessThanOrEqual(52);
    });

    it("returns high percentile for value above mean", () => {
      const p = provider.calculatePercentile(StanceDimension.TECH_REGULATION, 0.9);
      expect(p).toBeGreaterThan(70);
    });

    it("returns low percentile for value below mean", () => {
      const p = provider.calculatePercentile(StanceDimension.TECH_REGULATION, -0.9);
      expect(p).toBeLessThan(30);
    });

    it("clamps to 1-99", () => {
      const low = provider.calculatePercentile(StanceDimension.TECH_REGULATION, -5);
      const high = provider.calculatePercentile(StanceDimension.TECH_REGULATION, 5);
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

  describe("getDemographicLabel", () => {
    it("returns age + job label", () => {
      const p = new DemographicBaselineProvider("30대", "IT·테크");
      expect(p.getDemographicLabel()).toBe("30대 · IT·테크 대비");
    });

    it("returns age-only label", () => {
      const p = new DemographicBaselineProvider("30대");
      expect(p.getDemographicLabel()).toBe("30대 대비");
    });

    it("returns job-only label", () => {
      const p = new DemographicBaselineProvider(undefined, "IT·테크");
      expect(p.getDemographicLabel()).toBe("IT·테크 대비");
    });

    it("returns overall label", () => {
      const p = new DemographicBaselineProvider();
      expect(p.getDemographicLabel()).toBe("전체 응답자 대비");
    });
  });

  describe("different groups produce different percentiles", () => {
    it("same value yields different percentiles for different demographics", () => {
      const provider20 = new DemographicBaselineProvider("20대", "IT·테크");
      const provider50 = new DemographicBaselineProvider("50대", "공무원");

      const p20 = provider20.calculatePercentile(StanceDimension.TECH_OPTIMISM, 0.5);
      const p50 = provider50.calculatePercentile(StanceDimension.TECH_OPTIMISM, 0.5);

      // These should differ because different demographics have different baselines
      expect(p20).not.toBe(p50);
    });
  });
});
