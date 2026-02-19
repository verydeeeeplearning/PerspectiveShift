import { describe, it, expect } from "vitest";
import { ReadinessScore } from "../readiness-score";
import { InvalidReadinessScoreError } from "../../errors/domain-errors";

describe("ReadinessScore", () => {
  it("creates valid score", () => {
    const s = ReadinessScore.create(0.8);
    expect(s.value).toBe(0.8);
  });

  it("normalizes to 3 decimal places", () => {
    const s = ReadinessScore.create(0.12345);
    expect(s.value).toBe(0.123);
  });

  it("throws for negative value", () => {
    expect(() => ReadinessScore.create(-0.1)).toThrow(
      InvalidReadinessScoreError,
    );
  });

  it("throws for value > 1", () => {
    expect(() => ReadinessScore.create(1.1)).toThrow(
      InvalidReadinessScoreError,
    );
  });

  it("accepts boundary values", () => {
    expect(ReadinessScore.create(0).value).toBe(0);
    expect(ReadinessScore.create(1).value).toBe(1);
  });

  it("equals compares values", () => {
    const a = ReadinessScore.create(0.5);
    const b = ReadinessScore.create(0.5);
    expect(a.equals(b)).toBe(true);
  });
});
