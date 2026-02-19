/**
 * JITAI (Just-In-Time Adaptive Intervention) policy.
 * Determines what intervention to apply based on energy level and dialogue progress.
 */

export type InterventionType = "none" | "coach" | "scaffold" | "tone_check" | "break_suggest";

export interface InterventionDecision {
  type: InterventionType;
  scaffoldStrength: "light" | "medium" | "strong";
  coachTriggerMs: number;      // inactivity timer override (ms)
  reason: string;
}

const DEFAULT_COACH_MS = 90_000;

export class InterventionPolicy {
  /**
   * Pure domain logic: energy + progress → intervention decision.
   * No external dependencies.
   */
  static evaluate(input: {
    energy: number;           // 0-100
    turnCount: number;
    currentStep: string;
    secondsSinceLastTurn: number;
  }): InterventionDecision {
    const { energy, turnCount, currentStep, secondsSinceLastTurn } = input;

    // Low energy + early stage → strong scaffold + shorter coach timer
    if (energy < 30 && turnCount <= 2) {
      return {
        type: "scaffold",
        scaffoldStrength: "strong",
        coachTriggerMs: 45_000,
        reason: "low_energy_early_stage",
      };
    }

    // Low energy + late stage → suggest break
    if (energy < 20 && turnCount > 4) {
      return {
        type: "break_suggest",
        scaffoldStrength: "light",
        coachTriggerMs: DEFAULT_COACH_MS,
        reason: "low_energy_fatigue",
      };
    }

    // Medium energy + reflection step → medium scaffold to help articulate
    if (energy < 50 && currentStep === "REFLECTION") {
      return {
        type: "scaffold",
        scaffoldStrength: "medium",
        coachTriggerMs: 60_000,
        reason: "medium_energy_reflection",
      };
    }

    // Long inactivity → coach trigger
    if (secondsSinceLastTurn > 120) {
      return {
        type: "coach",
        scaffoldStrength: "light",
        coachTriggerMs: 30_000,
        reason: "prolonged_inactivity",
      };
    }

    // High energy, progressing normally → no intervention
    return {
      type: "none",
      scaffoldStrength: "light",
      coachTriggerMs: DEFAULT_COACH_MS,
      reason: "normal_progress",
    };
  }
}
