import { describe, it, expect } from "vitest";
import { SubmitMutualVerificationUseCase } from "../submit-mutual-verification";

describe("SubmitMutualVerificationUseCase", () => {
  const uc = new SubmitMutualVerificationUseCase();

  it("returns verification result with slider value", () => {
    const result = uc.execute({
      summarizedByOpponent: "AI는 위험하다",
      accuracySlider: 75,
    });
    expect(result.accuracySlider).toBe(75);
    expect(result.emoji).toBeDefined();
  });

  it("includes correction when provided", () => {
    const result = uc.execute({
      summarizedByOpponent: "요약",
      accuracySlider: 50,
      correctionText: "감정적 측면이 빠졌어요",
    });
    expect(result.hasCorrection).toBe(true);
    expect(result.correctionText).toContain("감정적");
  });

  it("clamps slider to valid range", () => {
    const result = uc.execute({ summarizedByOpponent: "s", accuracySlider: 200 });
    expect(result.accuracySlider).toBe(100);
  });
});
