import { describe, it, expect } from "vitest";
import { StanceAxis } from "../stance-axis";
import { InvalidStanceAxisError } from "../../errors/domain-errors";

describe("StanceAxis", () => {
  describe("create", () => {
    it("creates a valid axis with value within range", () => {
      const axis = StanceAxis.create(0.5);
      expect(axis.value).toBe(0.5);
    });

    it("accepts boundary value -1.0", () => {
      const axis = StanceAxis.create(-1.0);
      expect(axis.value).toBe(-1.0);
    });

    it("accepts boundary value 1.0", () => {
      const axis = StanceAxis.create(1.0);
      expect(axis.value).toBe(1.0);
    });

    it("accepts zero", () => {
      const axis = StanceAxis.create(0);
      expect(axis.value).toBe(0);
    });

    it("rounds to 3 decimal places", () => {
      const axis = StanceAxis.create(0.12345);
      expect(axis.value).toBe(0.123);
    });

    it("throws for value > 1.0", () => {
      expect(() => StanceAxis.create(1.1)).toThrow(
        InvalidStanceAxisError,
      );
    });

    it("throws for value < -1.0", () => {
      expect(() => StanceAxis.create(-1.1)).toThrow(
        InvalidStanceAxisError,
      );
    });

    it("throws for NaN", () => {
      expect(() => StanceAxis.create(NaN)).toThrow(
        InvalidStanceAxisError,
      );
    });

    it("throws for Infinity", () => {
      expect(() => StanceAxis.create(Infinity)).toThrow(
        InvalidStanceAxisError,
      );
    });
  });

  describe("neutral", () => {
    it("creates axis with value 0", () => {
      expect(StanceAxis.neutral().value).toBe(0);
    });
  });

  describe("equals", () => {
    it("returns true for same value", () => {
      const a = StanceAxis.create(0.5);
      const b = StanceAxis.create(0.5);
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for different values", () => {
      const a = StanceAxis.create(0.5);
      const b = StanceAxis.create(-0.5);
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("distanceTo", () => {
    it("calculates absolute distance", () => {
      const a = StanceAxis.create(-0.5);
      const b = StanceAxis.create(0.5);
      expect(a.distanceTo(b)).toBe(1.0);
    });

    it("returns 0 for equal axes", () => {
      const a = StanceAxis.create(0.3);
      const b = StanceAxis.create(0.3);
      expect(a.distanceTo(b)).toBe(0);
    });
  });
});
