import { describe, it, expect } from "vitest";
import { ReceptivenessScore } from "../receptiveness-score";

describe("ReceptivenessScore", () => {
  it("creates with initial zero values", () => {
    const score = ReceptivenessScore.initial("user-1");
    expect(score.userId).toBe("user-1");
    expect(score.totalPoints).toBe(0);
    expect(score.templateAdoptions).toBe(0);
    expect(score.feelHeardReceived).toBe(0);
    expect(score.percentile).toBeNull();
  });

  it("adds template adoption points", () => {
    const score = ReceptivenessScore.initial("user-1");
    const updated = score.addTemplateAdoption();
    expect(updated.templateAdoptions).toBe(1);
    expect(updated.totalPoints).toBe(5);
  });

  it("accumulates multiple template adoptions", () => {
    let score = ReceptivenessScore.initial("user-1");
    score = score.addTemplateAdoption();
    score = score.addTemplateAdoption();
    score = score.addTemplateAdoption();
    expect(score.templateAdoptions).toBe(3);
    expect(score.totalPoints).toBe(15);
  });

  it("adds feel heard bonus for score >= 4", () => {
    const score = ReceptivenessScore.initial("user-1");
    const updated = score.addFeelHeardBonus(4);
    expect(updated.feelHeardReceived).toBe(1);
    expect(updated.totalPoints).toBe(10);
  });

  it("adds higher feel heard bonus for score 5", () => {
    const score = ReceptivenessScore.initial("user-1");
    const updated = score.addFeelHeardBonus(5);
    expect(updated.feelHeardReceived).toBe(1);
    expect(updated.totalPoints).toBe(15);
  });

  it("does not add bonus for feel heard score < 4", () => {
    const score = ReceptivenessScore.initial("user-1");
    const updated = score.addFeelHeardBonus(3);
    expect(updated.feelHeardReceived).toBe(0);
    expect(updated.totalPoints).toBe(0);
  });

  it("reconstitutes from stored data", () => {
    const score = ReceptivenessScore.reconstitute({
      userId: "user-1",
      totalPoints: 30,
      templateAdoptions: 2,
      feelHeardReceived: 1,
      percentile: 15,
    });
    expect(score.totalPoints).toBe(30);
    expect(score.percentile).toBe(15);
  });

  it("withPercentile returns new instance with percentile set", () => {
    const score = ReceptivenessScore.initial("user-1");
    const updated = score.withPercentile(20);
    expect(updated.percentile).toBe(20);
    expect(score.percentile).toBeNull(); // original unchanged
  });
});
