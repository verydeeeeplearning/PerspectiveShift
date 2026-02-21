import { describe, it, expect } from "vitest";
import {
  OnboardingMode,
  ONBOARDING_MODES,
  type OnboardingModeKey,
} from "../onboarding-mode";

describe("OnboardingMode", () => {
  describe("create", () => {
    it("creates LITE mode with 10 questions", () => {
      const mode = OnboardingMode.create("LITE");
      expect(mode.key).toBe("LITE");
      expect(mode.questionCount).toBe(10);
      expect(mode.label).toBe("라이트");
      expect(mode.estimatedMinutes).toBe(3);
    });

    it("creates STANDARD mode with 20 questions", () => {
      const mode = OnboardingMode.create("STANDARD");
      expect(mode.key).toBe("STANDARD");
      expect(mode.questionCount).toBe(20);
      expect(mode.label).toBe("표준 분석");
      expect(mode.estimatedMinutes).toBe(7);
    });

    it("creates DEEP mode with 30 questions", () => {
      const mode = OnboardingMode.create("DEEP");
      expect(mode.key).toBe("DEEP");
      expect(mode.questionCount).toBe(30);
      expect(mode.label).toBe("심층 분석");
      expect(mode.estimatedMinutes).toBe(12);
    });

    it("creates COMPREHENSIVE mode with 50 questions", () => {
      const mode = OnboardingMode.create("COMPREHENSIVE");
      expect(mode.key).toBe("COMPREHENSIVE");
      expect(mode.questionCount).toBe(50);
      expect(mode.label).toBe("종합 분석");
      expect(mode.estimatedMinutes).toBe(20);
    });

    it("throws for invalid mode", () => {
      expect(() => OnboardingMode.create("INVALID" as OnboardingModeKey)).toThrow(
        "Invalid onboarding mode",
      );
    });
  });

  describe("equals", () => {
    it("returns true for same mode", () => {
      const a = OnboardingMode.create("LITE");
      const b = OnboardingMode.create("LITE");
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for different modes", () => {
      const a = OnboardingMode.create("LITE");
      const b = OnboardingMode.create("STANDARD");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("seedQuestionCount", () => {
    it("LITE mode has 10 seed questions (all are seed)", () => {
      const mode = OnboardingMode.create("LITE");
      expect(mode.seedQuestionCount).toBe(10);
      expect(mode.dynamicQuestionCount).toBe(0);
    });

    it("STANDARD mode has 10 seed + 10 dynamic", () => {
      const mode = OnboardingMode.create("STANDARD");
      expect(mode.seedQuestionCount).toBe(10);
      expect(mode.dynamicQuestionCount).toBe(10);
    });

    it("DEEP mode has 10 seed + 20 dynamic", () => {
      const mode = OnboardingMode.create("DEEP");
      expect(mode.seedQuestionCount).toBe(10);
      expect(mode.dynamicQuestionCount).toBe(20);
    });

    it("COMPREHENSIVE mode has 10 seed + 40 dynamic", () => {
      const mode = OnboardingMode.create("COMPREHENSIVE");
      expect(mode.seedQuestionCount).toBe(10);
      expect(mode.dynamicQuestionCount).toBe(40);
    });
  });

  describe("isRecommended", () => {
    it("STANDARD mode is recommended", () => {
      const mode = OnboardingMode.create("STANDARD");
      expect(mode.isRecommended).toBe(true);
    });

    it("LITE mode is not recommended", () => {
      const mode = OnboardingMode.create("LITE");
      expect(mode.isRecommended).toBe(false);
    });
  });

  it("ONBOARDING_MODES has all 4 modes", () => {
    expect(Object.keys(ONBOARDING_MODES)).toHaveLength(4);
    expect(ONBOARDING_MODES).toHaveProperty("LITE");
    expect(ONBOARDING_MODES).toHaveProperty("STANDARD");
    expect(ONBOARDING_MODES).toHaveProperty("DEEP");
    expect(ONBOARDING_MODES).toHaveProperty("COMPREHENSIVE");
  });
});
