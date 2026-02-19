import { describe, it, expect } from "vitest";
import {
  DistanceSafetyPackage,
  type SafetyPackageInput,
  type SafetyPackageOutput,
} from "../distance-safety-package";

describe("DistanceSafetyPackage", () => {
  it("first dialogue always gets LOW band", () => {
    const input: SafetyPackageInput = {
      readiness: 0.9,
      confidence: 0.9,
      fatigue: 0,
      isFirstDialogue: true,
      recentSatisfaction: 0.8,
    };
    const result = DistanceSafetyPackage.calculate(input);
    expect(result.band.min).toBe(0.2);
    expect(result.band.max).toBe(0.4);
    expect(result.topicLevelMax).toBeLessThanOrEqual(1);
  });

  it("low readiness gets LOW band", () => {
    const input: SafetyPackageInput = {
      readiness: 0.3,
      confidence: 0.5,
      fatigue: 0.2,
      isFirstDialogue: false,
      recentSatisfaction: 0.5,
    };
    const result = DistanceSafetyPackage.calculate(input);
    expect(result.band.min).toBe(0.2);
    expect(result.band.max).toBe(0.4);
  });

  it("high fatigue gets LOW band", () => {
    const input: SafetyPackageInput = {
      readiness: 0.7,
      confidence: 0.5,
      fatigue: 0.8,
      isFirstDialogue: false,
      recentSatisfaction: 0.6,
    };
    const result = DistanceSafetyPackage.calculate(input);
    expect(result.band.min).toBe(0.2);
    expect(result.band.max).toBe(0.4);
  });

  it("very high confidence gets LOW band (too opinionated)", () => {
    const input: SafetyPackageInput = {
      readiness: 0.6,
      confidence: 0.95,
      fatigue: 0.1,
      isFirstDialogue: false,
      recentSatisfaction: 0.5,
    };
    const result = DistanceSafetyPackage.calculate(input);
    expect(result.band.min).toBe(0.2);
    expect(result.band.max).toBe(0.4);
  });

  it("medium readiness + medium confidence gets MEDIUM band", () => {
    const input: SafetyPackageInput = {
      readiness: 0.6,
      confidence: 0.5,
      fatigue: 0.3,
      isFirstDialogue: false,
      recentSatisfaction: 0.6,
    };
    const result = DistanceSafetyPackage.calculate(input);
    expect(result.band.min).toBe(0.3);
    expect(result.band.max).toBe(0.6);
  });

  it("high readiness + recent high satisfaction gets HIGH band", () => {
    const input: SafetyPackageInput = {
      readiness: 0.8,
      confidence: 0.5,
      fatigue: 0.1,
      isFirstDialogue: false,
      recentSatisfaction: 0.8,
    };
    const result = DistanceSafetyPackage.calculate(input);
    expect(result.band.min).toBe(0.4);
    expect(result.band.max).toBe(0.8);
  });

  it("LOW band allows topic 0-1, medium facilitator", () => {
    const input: SafetyPackageInput = {
      readiness: 0.3,
      confidence: 0.5,
      fatigue: 0.2,
      isFirstDialogue: false,
      recentSatisfaction: 0.5,
    };
    const result = DistanceSafetyPackage.calculate(input);
    expect(result.topicLevelMin).toBe(0);
    expect(result.topicLevelMax).toBe(1);
    expect(result.facilitatorIntensity).toBe("MEDIUM");
    expect(result.reflectionLevel).toBe("SUMMARY_ONLY");
  });

  it("MEDIUM band allows topic 0-2, medium facilitator", () => {
    const input: SafetyPackageInput = {
      readiness: 0.6,
      confidence: 0.5,
      fatigue: 0.3,
      isFirstDialogue: false,
      recentSatisfaction: 0.6,
    };
    const result = DistanceSafetyPackage.calculate(input);
    expect(result.topicLevelMin).toBe(0);
    expect(result.topicLevelMax).toBe(2);
    expect(result.facilitatorIntensity).toBe("MEDIUM");
    expect(result.reflectionLevel).toBe("GUIDED");
  });

  it("HIGH band allows topic 1-3, high facilitator, full reflection", () => {
    const input: SafetyPackageInput = {
      readiness: 0.8,
      confidence: 0.5,
      fatigue: 0.1,
      isFirstDialogue: false,
      recentSatisfaction: 0.8,
    };
    const result = DistanceSafetyPackage.calculate(input);
    expect(result.topicLevelMin).toBe(1);
    expect(result.topicLevelMax).toBe(3);
    expect(result.facilitatorIntensity).toBe("HIGH");
    expect(result.reflectionLevel).toBe("FULL");
  });
});
