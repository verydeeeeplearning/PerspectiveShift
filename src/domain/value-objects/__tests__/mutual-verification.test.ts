import { describe, it, expect } from "vitest";
import { MutualVerification } from "../mutual-verification";

describe("MutualVerification", () => {
  it("creates with summary and slider value", () => {
    const mv = MutualVerification.create({
      summarizedByOpponent: "AI가 일자리를 빼앗을 수 있다는 입장",
      accuracySlider: 80,
    });
    expect(mv.summarizedByOpponent).toContain("AI");
    expect(mv.accuracySlider).toBe(80);
  });

  it("defaults correctionText to null", () => {
    const mv = MutualVerification.create({
      summarizedByOpponent: "요약",
      accuracySlider: 50,
    });
    expect(mv.correctionText).toBeNull();
  });

  it("accepts optional correctionText", () => {
    const mv = MutualVerification.create({
      summarizedByOpponent: "요약",
      accuracySlider: 50,
      correctionText: "조금 다른 부분은 감정적 측면이에요",
    });
    expect(mv.correctionText).toContain("감정적");
  });

  it("clamps slider to 0-100 range", () => {
    const mv1 = MutualVerification.create({ summarizedByOpponent: "s", accuracySlider: -10 });
    expect(mv1.accuracySlider).toBe(0);
    const mv2 = MutualVerification.create({ summarizedByOpponent: "s", accuracySlider: 150 });
    expect(mv2.accuracySlider).toBe(100);
  });

  it("returns emoji for slider value", () => {
    const low = MutualVerification.create({ summarizedByOpponent: "s", accuracySlider: 20 });
    expect(low.emoji).toBeDefined();
    const high = MutualVerification.create({ summarizedByOpponent: "s", accuracySlider: 90 });
    expect(high.emoji).toBeDefined();
    expect(low.emoji).not.toBe(high.emoji);
  });

  it("hasCorrection returns true when correctionText exists", () => {
    const mv = MutualVerification.create({
      summarizedByOpponent: "s",
      accuracySlider: 50,
      correctionText: "수정",
    });
    expect(mv.hasCorrection).toBe(true);
  });

  it("hasCorrection returns false when no correctionText", () => {
    const mv = MutualVerification.create({ summarizedByOpponent: "s", accuracySlider: 50 });
    expect(mv.hasCorrection).toBe(false);
  });

  it("throws if summarizedByOpponent is empty", () => {
    expect(() => MutualVerification.create({ summarizedByOpponent: "", accuracySlider: 50 })).toThrow();
  });
});
