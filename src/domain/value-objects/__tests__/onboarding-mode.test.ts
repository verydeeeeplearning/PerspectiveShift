import { describe, it, expect } from "vitest";
import {
  OnboardingMode,
  ONBOARDING_MODES,
  type OnboardingModeKey,
} from "../onboarding-mode";

describe("OnboardingMode", () => {
  describe("create", () => {
    it("creates QUICK mode with 5 questions", () => {
      const mode = OnboardingMode.create("QUICK");
      expect(mode.key).toBe("QUICK");
      expect(mode.questionCount).toBe(5);
      expect(mode.label).toBe("빠르게 시작");
      expect(mode.estimatedMinutes).toBe(2);
    });

    it("creates STANDARD mode with 10 questions", () => {
      const mode = OnboardingMode.create("STANDARD");
      expect(mode.key).toBe("STANDARD");
      expect(mode.questionCount).toBe(10);
      expect(mode.label).toBe("표준 분석");
      expect(mode.estimatedMinutes).toBe(4);
    });

    it("creates PRECISE mode with 20 questions", () => {
      const mode = OnboardingMode.create("PRECISE");
      expect(mode.key).toBe("PRECISE");
      expect(mode.questionCount).toBe(20);
      expect(mode.label).toBe("정밀 분석");
      expect(mode.estimatedMinutes).toBe(9);
    });

    it("throws for invalid mode", () => {
      expect(() => OnboardingMode.create("INVALID" as OnboardingModeKey)).toThrow(
        "Invalid onboarding mode",
      );
    });
  });

  describe("equals", () => {
    it("returns true for same mode", () => {
      const a = OnboardingMode.create("QUICK");
      const b = OnboardingMode.create("QUICK");
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for different modes", () => {
      const a = OnboardingMode.create("QUICK");
      const b = OnboardingMode.create("STANDARD");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("coreQuestionCount", () => {
    it("QUICK mode has 5 core questions (all are core)", () => {
      const mode = OnboardingMode.create("QUICK");
      expect(mode.coreQuestionCount).toBe(5);
    });

    it("STANDARD mode has 5 core + 5 extended", () => {
      const mode = OnboardingMode.create("STANDARD");
      expect(mode.coreQuestionCount).toBe(5);
      expect(mode.extendedQuestionCount).toBe(5);
    });

    it("PRECISE mode has 5 core + 15 extended", () => {
      const mode = OnboardingMode.create("PRECISE");
      expect(mode.coreQuestionCount).toBe(5);
      expect(mode.extendedQuestionCount).toBe(15);
    });
  });

  describe("isRecommended", () => {
    it("QUICK mode is recommended", () => {
      const mode = OnboardingMode.create("QUICK");
      expect(mode.isRecommended).toBe(true);
    });

    it("STANDARD mode is not recommended", () => {
      const mode = OnboardingMode.create("STANDARD");
      expect(mode.isRecommended).toBe(false);
    });
  });

  it("ONBOARDING_MODES has all 3 modes", () => {
    expect(Object.keys(ONBOARDING_MODES)).toHaveLength(3);
    expect(ONBOARDING_MODES).toHaveProperty("QUICK");
    expect(ONBOARDING_MODES).toHaveProperty("STANDARD");
    expect(ONBOARDING_MODES).toHaveProperty("PRECISE");
  });
});
