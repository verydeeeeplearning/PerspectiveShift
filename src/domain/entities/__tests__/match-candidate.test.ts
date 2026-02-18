import { describe, it, expect } from "vitest";
import { MatchCandidate } from "../match-candidate";
import { OpinionDistance } from "../../value-objects/opinion-distance";
import { ReadinessScore } from "../../value-objects/readiness-score";
import { MatchScore } from "../../value-objects/match-score";

describe("MatchCandidate", () => {
  function createCandidate(distanceVal = 0.55, readinessVal = 0.8) {
    const distance = OpinionDistance.create(distanceVal);
    const readiness = ReadinessScore.create(readinessVal);
    const score = MatchScore.calculate(distance, readiness);
    return MatchCandidate.create({
      sessionId: "session-1",
      distance,
      readiness,
      score,
    });
  }

  it("creates candidate with all properties", () => {
    const candidate = createCandidate();
    expect(candidate.sessionId).toBe("session-1");
    expect(candidate.distance.value).toBe(0.55);
    expect(candidate.readiness.value).toBe(0.8);
  });

  it("isInSweetSpot delegates to distance", () => {
    expect(createCandidate(0.55).isInSweetSpot()).toBe(true);
    expect(createCandidate(0.1).isInSweetSpot()).toBe(false);
  });
});
