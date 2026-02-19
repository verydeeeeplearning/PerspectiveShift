/**
 * JITAI (Just-In-Time Adaptive Intervention) policy.
 * Determines what intervention to apply based on energy level and dialogue progress.
 */

import { normalizeJitaiSignal, type JitaiSignal } from "./jitai-signal";

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
   * Pure domain logic: user signal + progress → intervention decision.
   * No external dependencies.
   */
  static evaluate(input: JitaiSignal): InterventionDecision {
    const signal = normalizeJitaiSignal(input);
    const {
      energy,
      turnCount,
      currentStep,
      idleSeconds,
      deleteCount,
      consecutiveToneChecks,
      feelHeardScore,
      highlightCount,
      quoteCount,
      hasReport,
    } = signal;

    // Rule D (distress): immediate safety-first break suggestion
    if (hasReport || feelHeardScore < 2 || (energy < 20 && turnCount > 4)) {
      return {
        type: "break_suggest",
        scaffoldStrength: "light",
        coachTriggerMs: DEFAULT_COACH_MS,
        reason: "distress_signal",
      };
    }

    // Rule A (fatigue): low energy in early stage
    if (energy < 30 && turnCount <= 2) {
      return {
        type: "scaffold",
        scaffoldStrength: "strong",
        coachTriggerMs: 45_000,
        reason: "low_energy_early_stage",
      };
    }

    // Rule C (tension): repeated tone checks
    if (consecutiveToneChecks >= 2) {
      return {
        type: "tone_check",
        scaffoldStrength: "light",
        coachTriggerMs: 45_000,
        reason: "repeated_tone_tension",
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

    // Rule B (blank fear): idle + repeated delete
    if (idleSeconds >= 90 && deleteCount >= 2) {
      return {
        type: "coach",
        scaffoldStrength: "light",
        coachTriggerMs: 40_000,
        reason: "idle_with_rewrites",
      };
    }

    // Fallback inactivity rule
    if (idleSeconds > 120) {
      return {
        type: "coach",
        scaffoldStrength: "light",
        coachTriggerMs: 30_000,
        reason: "prolonged_inactivity",
      };
    }

    // Rule E (low listening): no highlights and no quotes
    if (turnCount >= 2 && highlightCount === 0 && quoteCount === 0) {
      return {
        type: "coach",
        scaffoldStrength: "light",
        coachTriggerMs: 45_000,
        reason: "low_listening_signal",
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
