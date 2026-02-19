import { describe, it, expect } from "vitest";
import { MatchCandidate } from "../match-candidate";
import { OpinionDistance } from "../../value-objects/opinion-distance";
import { ReadinessScore } from "../../value-objects/readiness-score";
import { MatchScore } from "../../value-objects/match-score";

describe("MatchCandidate", () => {
  function createCandidate(
    distanceVal = 0.55,
    readinessVal = 0.8,
    extra?: { energyCompat?: number; recentDeclinePenalty?: number },
  ) {
    const distance = OpinionDistance.create(distanceVal);
    const readiness = ReadinessScore.create(readinessVal);
    const score = MatchScore.calculate(distance, readiness);
    return MatchCandidate.create({
      sessionId: "session-1",
      distance,
      readiness,
      score,
      ...extra,
    });
  }

  // --- Backwards compatibility ---
  it("creates candidate with all properties - backwards compat", () => {
    const candidate = createCandidate();
    expect(candidate.sessionId).toBe("session-1");
    expect(candidate.distance.value).toBe(0.55);
    expect(candidate.readiness.value).toBe(0.8);
  });

  it("isInSweetSpot delegates to distance - backwards compat", () => {
    expect(createCandidate(0.55).isInSweetSpot()).toBe(true);
    expect(createCandidate(0.1).isInSweetSpot()).toBe(false);
  });

  // --- New energy compat and decline penalty fields ---
  it("defaults energyCompat to 0.5 when not provided", () => {
    const candidate = createCandidate();
    expect(candidate.energyCompat).toBe(0.5);
  });

  it("defaults recentDeclinePenalty to 0 when not provided", () => {
    const candidate = createCandidate();
    expect(candidate.recentDeclinePenalty).toBe(0);
  });

  it("stores energyCompat when explicitly provided", () => {
    const candidate = createCandidate(0.55, 0.8, { energyCompat: 1.0 });
    expect(candidate.energyCompat).toBe(1.0);
  });

  it("stores recentDeclinePenalty when explicitly provided", () => {
    const candidate = createCandidate(0.55, 0.8, { recentDeclinePenalty: 0.15 });
    expect(candidate.recentDeclinePenalty).toBe(0.15);
  });

  it("stores both energyCompat and recentDeclinePenalty together", () => {
    const candidate = createCandidate(0.55, 0.8, {
      energyCompat: 0.7,
      recentDeclinePenalty: 0.1,
    });
    expect(candidate.energyCompat).toBe(0.7);
    expect(candidate.recentDeclinePenalty).toBe(0.1);
  });
});
