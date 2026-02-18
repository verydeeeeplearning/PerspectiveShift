import { describe, it, expect } from "vitest";
import { ThoughtMap } from "../thought-map";
import { StanceVector } from "../stance-vector";
import { StanceDimension, ALL_DIMENSIONS } from "../../value-objects/stance-dimension";
import { MapTypeName } from "../../value-objects/map-type";

describe("ThoughtMap", () => {
  const neutralVector = StanceVector.neutral();

  const samplePercentiles = ALL_DIMENSIONS.map((dim) => ({
    dimension: dim,
    percentile: 50,
  }));

  describe("create", () => {
    it("creates ThoughtMap with auto-classified type", () => {
      const map = ThoughtMap.create({
        vector: neutralVector,
        percentiles: samplePercentiles,
        precision: "initial",
      });

      expect(map.mapType.name).toBe(MapTypeName.BALANCE_SEEKER);
      expect(map.precision).toBe("initial");
      expect(map.createdAt).toBeInstanceOf(Date);
    });

    it("classifies non-neutral vector", () => {
      const vector = StanceVector.fromValues({
        TECH_REGULATION: -0.8,
        REDISTRIBUTION: -0.7,
        WORK_LIFE: -0.3,
        MERITOCRACY: 0.6,
        TECH_OPTIMISM: 0.9,
        OPPORTUNITY_EQUALITY: -0.4,
      });

      const map = ThoughtMap.create({
        vector,
        percentiles: samplePercentiles,
        precision: "refined",
      });

      expect(map.mapType.name).toBe(MapTypeName.LIBERTY_INNOVATOR);
      expect(map.precision).toBe("refined");
    });
  });

  describe("getPercentile", () => {
    it("returns percentile for existing dimension", () => {
      const map = ThoughtMap.create({
        vector: neutralVector,
        percentiles: [
          { dimension: StanceDimension.TECH_REGULATION, percentile: 75 },
          ...ALL_DIMENSIONS.filter(
            (d) => d !== StanceDimension.TECH_REGULATION,
          ).map((d) => ({ dimension: d, percentile: 50 })),
        ],
        precision: "initial",
      });

      expect(
        map.getPercentile(StanceDimension.TECH_REGULATION),
      ).toBe(75);
    });

    it("returns undefined for missing dimension", () => {
      const map = ThoughtMap.create({
        vector: neutralVector,
        percentiles: [],
        precision: "initial",
      });

      expect(
        map.getPercentile(StanceDimension.TECH_REGULATION),
      ).toBeUndefined();
    });
  });

  describe("hasAllPercentiles", () => {
    it("returns true when all 6 dimensions present", () => {
      const map = ThoughtMap.create({
        vector: neutralVector,
        percentiles: samplePercentiles,
        precision: "initial",
      });
      expect(map.hasAllPercentiles()).toBe(true);
    });

    it("returns false when dimensions missing", () => {
      const map = ThoughtMap.create({
        vector: neutralVector,
        percentiles: [
          { dimension: StanceDimension.TECH_REGULATION, percentile: 50 },
        ],
        precision: "initial",
      });
      expect(map.hasAllPercentiles()).toBe(false);
    });
  });
});
