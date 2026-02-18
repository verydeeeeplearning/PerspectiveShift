import { describe, it, expect } from "vitest";
import { MatchScore } from "../match-score";
import { OpinionDistance } from "../opinion-distance";
import { ReadinessScore } from "../readiness-score";

describe("MatchScore", () => {
  it("calculates score for sweet spot center (0.55)", () => {
    const distance = OpinionDistance.create(0.55);
    const readiness = ReadinessScore.create(1.0);
    const score = MatchScore.calculate(distance, readiness);
    expect(score.distanceFit).toBe(1);
    expect(score.readinessComponent).toBe(1);
    expect(score.value).toBe(1);
  });

  it("calculates score for sweet spot edge (0.4)", () => {
    const distance = OpinionDistance.create(0.4);
    const readiness = ReadinessScore.create(0.5);
    const score = MatchScore.calculate(distance, readiness);
    expect(score.distanceFit).toBe(0);
    expect(score.readinessComponent).toBe(0.5);
    expect(score.value).toBe(0.2);
  });

  it("returns 0 distanceFit for out of sweet spot", () => {
    const distance = OpinionDistance.create(0.1);
    const readiness = ReadinessScore.create(1.0);
    const score = MatchScore.calculate(distance, readiness);
    expect(score.distanceFit).toBe(0);
    expect(score.value).toBe(0.4);
  });

  it("applies weight formula: distance*0.6 + readiness*0.4", () => {
    const distance = OpinionDistance.create(0.55);
    const readiness = ReadinessScore.create(0.5);
    const score = MatchScore.calculate(distance, readiness);
    expect(score.value).toBe(0.8);
  });

  it("equals compares values", () => {
    const d = OpinionDistance.create(0.55);
    const r = ReadinessScore.create(1.0);
    const a = MatchScore.calculate(d, r);
    const b = MatchScore.calculate(d, r);
    expect(a.equals(b)).toBe(true);
  });
});
