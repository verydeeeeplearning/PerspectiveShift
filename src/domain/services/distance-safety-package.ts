import { DistanceBand, STANDARD_BANDS } from "../value-objects/distance-band";

export type FacilitatorIntensity = "LOW" | "MEDIUM" | "HIGH";
export type ReflectionLevel = "SUMMARY_ONLY" | "GUIDED" | "FULL";

export interface SafetyPackageInput {
  readiness: number;       // 0-1
  confidence: number;      // 0-1
  fatigue: number;         // 0-1
  isFirstDialogue: boolean;
  recentSatisfaction: number; // 0-1
}

export interface SafetyPackageOutput {
  band: DistanceBand;
  topicLevelMin: number;
  topicLevelMax: number;
  facilitatorIntensity: FacilitatorIntensity;
  reflectionLevel: ReflectionLevel;
}

export class DistanceSafetyPackage {
  static calculate(input: SafetyPackageInput): SafetyPackageOutput {
    const bandLevel = this.determineBandLevel(input);

    switch (bandLevel) {
      case "LOW":
        return {
          band: STANDARD_BANDS.LOW,
          topicLevelMin: 0,
          topicLevelMax: 1,
          facilitatorIntensity: "MEDIUM",
          reflectionLevel: "SUMMARY_ONLY",
        };
      case "MEDIUM":
        return {
          band: STANDARD_BANDS.MEDIUM,
          topicLevelMin: 0,
          topicLevelMax: 2,
          facilitatorIntensity: "MEDIUM",
          reflectionLevel: "GUIDED",
        };
      case "HIGH":
        return {
          band: STANDARD_BANDS.HIGH,
          topicLevelMin: 1,
          topicLevelMax: 3,
          facilitatorIntensity: "HIGH",
          reflectionLevel: "FULL",
        };
    }
  }

  private static determineBandLevel(
    input: SafetyPackageInput,
  ): "LOW" | "MEDIUM" | "HIGH" {
    // First dialogue: always LOW
    if (input.isFirstDialogue) return "LOW";

    // Safety triggers → LOW
    if (input.readiness < 0.5) return "LOW";
    if (input.fatigue > 0.6) return "LOW";
    if (input.confidence > 0.9) return "LOW";

    // HIGH conditions: high readiness + recent satisfaction
    if (input.readiness >= 0.75 && input.recentSatisfaction >= 0.7) {
      return "HIGH";
    }

    // Default: MEDIUM
    return "MEDIUM";
  }
}
