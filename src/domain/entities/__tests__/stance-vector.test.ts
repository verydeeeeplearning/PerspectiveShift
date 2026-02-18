import { describe, it, expect } from "vitest";
import { StanceVector } from "../stance-vector";
import { StanceAxis } from "../../value-objects/stance-axis";
import { StanceDimension } from "../../value-objects/stance-dimension";
import { IncompleteStanceVectorError } from "../../errors/domain-errors";

function makeFullValues(
  base: number = 0,
): Record<StanceDimension, number> {
  return {
    TECH_REGULATION: base,
    REDISTRIBUTION: base,
    WORK_LIFE: base,
    MERITOCRACY: base,
    TECH_OPTIMISM: base,
    OPPORTUNITY_EQUALITY: base,
  };
}

describe("StanceVector", () => {
  describe("fromValues", () => {
    it("creates vector from numeric values", () => {
      const vector = StanceVector.fromValues(makeFullValues(0.5));
      expect(vector.get(StanceDimension.TECH_REGULATION).value).toBe(
        0.5,
      );
    });

    it("creates vector with all 6 dimensions", () => {
      const vector = StanceVector.fromValues(makeFullValues());
      const values = vector.toValues();
      expect(Object.keys(values)).toHaveLength(6);
    });
  });

  describe("create", () => {
    it("throws when missing dimensions", () => {
      const partial = {} as Record<StanceDimension, StanceAxis>;
      partial.TECH_REGULATION = StanceAxis.create(0.5);
      expect(() => StanceVector.create(partial)).toThrow(
        IncompleteStanceVectorError,
      );
    });
  });

  describe("neutral", () => {
    it("creates vector with all zeros", () => {
      const vector = StanceVector.neutral();
      const values = vector.toValues();
      for (const val of Object.values(values)) {
        expect(val).toBe(0);
      }
    });
  });

  describe("cosineDistance", () => {
    it("returns 0 for identical vectors", () => {
      const a = StanceVector.fromValues(makeFullValues(0.5));
      const b = StanceVector.fromValues(makeFullValues(0.5));
      expect(a.cosineDistance(b)).toBeCloseTo(0, 5);
    });

    it("returns 2 for opposite vectors", () => {
      const a = StanceVector.fromValues(makeFullValues(1));
      const b = StanceVector.fromValues(makeFullValues(-1));
      expect(a.cosineDistance(b)).toBeCloseTo(2, 5);
    });

    it("returns 1 when one vector is neutral", () => {
      const a = StanceVector.fromValues(makeFullValues(0.5));
      const b = StanceVector.neutral();
      expect(b.cosineDistance(a)).toBe(1);
    });

    it("handles orthogonal vectors", () => {
      const a = StanceVector.fromValues({
        TECH_REGULATION: 1,
        REDISTRIBUTION: 0,
        WORK_LIFE: 0,
        MERITOCRACY: 0,
        TECH_OPTIMISM: 0,
        OPPORTUNITY_EQUALITY: 0,
      });
      const b = StanceVector.fromValues({
        TECH_REGULATION: 0,
        REDISTRIBUTION: 1,
        WORK_LIFE: 0,
        MERITOCRACY: 0,
        TECH_OPTIMISM: 0,
        OPPORTUNITY_EQUALITY: 0,
      });
      expect(a.cosineDistance(b)).toBeCloseTo(1, 5);
    });
  });

  describe("merge", () => {
    it("replaces specified dimension", () => {
      const vector = StanceVector.neutral();
      const merged = vector.merge({
        TECH_REGULATION: StanceAxis.create(0.8),
      });
      expect(merged.get(StanceDimension.TECH_REGULATION).value).toBe(
        0.8,
      );
      expect(merged.get(StanceDimension.REDISTRIBUTION).value).toBe(0);
    });

    it("does not mutate original vector", () => {
      const original = StanceVector.neutral();
      original.merge({
        TECH_REGULATION: StanceAxis.create(0.8),
      });
      expect(
        original.get(StanceDimension.TECH_REGULATION).value,
      ).toBe(0);
    });
  });

  describe("toValues", () => {
    it("returns plain number record", () => {
      const values = makeFullValues(0.3);
      const vector = StanceVector.fromValues(values);
      const result = vector.toValues();
      expect(result.TECH_REGULATION).toBe(0.3);
      expect(typeof result.TECH_REGULATION).toBe("number");
    });
  });
});
