import { describe, it, expect } from "vitest";
import { FatigueScore } from "../fatigue-score";

describe("FatigueScore", () => {
  it("LOW for few recent dialogues and positive emotion", () => {
    const score = FatigueScore.calculate({
      recentDialogueCount: 1,
      negativeEmotionRecent: false,
      averageSessionMinutes: 15,
      sessionMinutesTrend: "STABLE",
    });
    expect(score.level).toBe("LOW");
  });

  it("HIGH for 5+ dialogues in 7 days", () => {
    const score = FatigueScore.calculate({
      recentDialogueCount: 5,
      negativeEmotionRecent: false,
      averageSessionMinutes: 15,
      sessionMinutesTrend: "STABLE",
    });
    expect(score.level).toBe("HIGH");
  });

  it("HIGH for recent negative emotion", () => {
    const score = FatigueScore.calculate({
      recentDialogueCount: 2,
      negativeEmotionRecent: true,
      averageSessionMinutes: 15,
      sessionMinutesTrend: "STABLE",
    });
    expect(score.level).toBe("HIGH");
  });

  it("HIGH for increasing session length trend", () => {
    const score = FatigueScore.calculate({
      recentDialogueCount: 3,
      negativeEmotionRecent: false,
      averageSessionMinutes: 30,
      sessionMinutesTrend: "INCREASING",
    });
    expect(score.level).toBe("HIGH");
  });

  it("MEDIUM for moderate activity", () => {
    const score = FatigueScore.calculate({
      recentDialogueCount: 3,
      negativeEmotionRecent: false,
      averageSessionMinutes: 20,
      sessionMinutesTrend: "STABLE",
    });
    expect(score.level).toBe("MEDIUM");
  });

  it("needsCooldown returns true for HIGH", () => {
    const score = FatigueScore.calculate({
      recentDialogueCount: 6,
      negativeEmotionRecent: false,
      averageSessionMinutes: 15,
      sessionMinutesTrend: "STABLE",
    });
    expect(score.needsCooldown()).toBe(true);
  });

  it("needsCooldown returns false for LOW", () => {
    const score = FatigueScore.calculate({
      recentDialogueCount: 1,
      negativeEmotionRecent: false,
      averageSessionMinutes: 15,
      sessionMinutesTrend: "STABLE",
    });
    expect(score.needsCooldown()).toBe(false);
  });
});
