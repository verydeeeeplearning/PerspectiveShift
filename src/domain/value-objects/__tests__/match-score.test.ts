import { describe, it, expect } from "vitest";
import { MatchScore } from "../match-score";
import { OpinionDistance } from "../opinion-distance";
import { ReadinessScore } from "../readiness-score";

describe("MatchScore", () => {
  // --- Backwards compatibility: old 2-arg signature still works ---
  it("calculates score for sweet spot center (0.55) - backwards compat", () => {
    const distance = OpinionDistance.create(0.55);
    const readiness = ReadinessScore.create(1.0);
    const score = MatchScore.calculate(distance, readiness);
    expect(score.distanceFit).toBe(1);
    expect(score.readinessComponent).toBe(1);
    // New formula: 1*0.35 + 1*0.25 + 0.5*0.2 + 0.5*0.2 - 0 = 0.8
    expect(score.value).toBe(0.8);
  });

  it("calculates score for sweet spot edge (0.4) - backwards compat", () => {
    const distance = OpinionDistance.create(0.4);
    const readiness = ReadinessScore.create(0.5);
    const score = MatchScore.calculate(distance, readiness);
    expect(score.distanceFit).toBe(0);
    expect(score.readinessComponent).toBe(0.5);
    // 0*0.35 + 0.5*0.25 + 0.5*0.2 + 0.5*0.2 = 0.125 + 0.1 + 0.1 = 0.325
    expect(score.value).toBe(0.325);
  });

  it("returns 0 distanceFit for out of sweet spot - backwards compat", () => {
    const distance = OpinionDistance.create(0.1);
    const readiness = ReadinessScore.create(1.0);
    const score = MatchScore.calculate(distance, readiness);
    expect(score.distanceFit).toBe(0);
    // 0*0.35 + 1*0.25 + 0.5*0.2 + 0.5*0.2 = 0.25 + 0.1 + 0.1 = 0.45
    expect(score.value).toBe(0.45);
  });

  it("equals compares values - backwards compat", () => {
    const d = OpinionDistance.create(0.55);
    const r = ReadinessScore.create(1.0);
    const a = MatchScore.calculate(d, r);
    const b = MatchScore.calculate(d, r);
    expect(a.equals(b)).toBe(true);
  });

  // --- New 4-weight formula tests ---
  it("applies new 4-weight formula: w1*distFit + w2*readiness + w3*topic + w4*energy - penalty", () => {
    const distance = OpinionDistance.create(0.55);
    const readiness = ReadinessScore.create(0.8);
    const score = MatchScore.calculate(distance, readiness, {
      topicRelevance: 0.9,
      energyCompat: 1.0,
      declinePenalty: 0,
    });
    // distanceFit = 1 (sweet spot center)
    // 1*0.35 + 0.8*0.25 + 0.9*0.2 + 1.0*0.2 - 0 = 0.35 + 0.2 + 0.18 + 0.2 = 0.93
    expect(score.distanceFit).toBe(1);
    expect(score.readinessComponent).toBe(0.8);
    expect(score.topicRelevance).toBe(0.9);
    expect(score.energyCompat).toBe(1.0);
    expect(score.declinePenalty).toBe(0);
    expect(score.value).toBe(0.93);
  });

  it("applies decline penalty reducing score", () => {
    const distance = OpinionDistance.create(0.55);
    const readiness = ReadinessScore.create(1.0);
    const scoreWithoutPenalty = MatchScore.calculate(distance, readiness, {
      topicRelevance: 0.5,
      energyCompat: 0.5,
      declinePenalty: 0,
    });
    const scoreWithPenalty = MatchScore.calculate(distance, readiness, {
      topicRelevance: 0.5,
      energyCompat: 0.5,
      declinePenalty: 0.15,
    });
    expect(scoreWithPenalty.declinePenalty).toBe(0.15);
    expect(scoreWithPenalty.value).toBeLessThan(scoreWithoutPenalty.value);
    expect(scoreWithPenalty.value).toBe(
      Math.round((scoreWithoutPenalty.value - 0.15) * 1000) / 1000,
    );
  });

  it("clamps score to 0 when penalty makes it negative", () => {
    const distance = OpinionDistance.create(0.1); // out of sweet spot, distanceFit = 0
    const readiness = ReadinessScore.create(0.1);
    const score = MatchScore.calculate(distance, readiness, {
      topicRelevance: 0,
      energyCompat: 0,
      declinePenalty: 1.0,
    });
    expect(score.value).toBe(0);
  });

  it("defaults topicRelevance and energyCompat to 0.5 when options omitted", () => {
    const distance = OpinionDistance.create(0.55);
    const readiness = ReadinessScore.create(0.5);
    const score = MatchScore.calculate(distance, readiness);
    expect(score.topicRelevance).toBe(0.5);
    expect(score.energyCompat).toBe(0.5);
    expect(score.declinePenalty).toBe(0);
  });

  it("high energy compat increases score vs low energy compat", () => {
    const distance = OpinionDistance.create(0.55);
    const readiness = ReadinessScore.create(0.8);
    const highEnergy = MatchScore.calculate(distance, readiness, { energyCompat: 1.0 });
    const lowEnergy = MatchScore.calculate(distance, readiness, { energyCompat: 0.3 });
    expect(highEnergy.value).toBeGreaterThan(lowEnergy.value);
  });

  it("high topic relevance increases score vs low topic relevance", () => {
    const distance = OpinionDistance.create(0.55);
    const readiness = ReadinessScore.create(0.8);
    const highTopic = MatchScore.calculate(distance, readiness, { topicRelevance: 1.0 });
    const lowTopic = MatchScore.calculate(distance, readiness, { topicRelevance: 0.1 });
    expect(highTopic.value).toBeGreaterThan(lowTopic.value);
  });
});
