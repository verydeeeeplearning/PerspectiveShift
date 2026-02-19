export type FatigueLevel = "LOW" | "MEDIUM" | "HIGH";
export type SessionTrend = "DECREASING" | "STABLE" | "INCREASING";

export interface FatigueInput {
  recentDialogueCount: number; // dialogues in last 7 days
  negativeEmotionRecent: boolean;
  averageSessionMinutes: number;
  sessionMinutesTrend: SessionTrend;
}

export class FatigueScore {
  readonly level: FatigueLevel;

  private constructor(level: FatigueLevel) {
    this.level = level;
  }

  static calculate(input: FatigueInput): FatigueScore {
    if (
      input.recentDialogueCount >= 5 ||
      input.negativeEmotionRecent ||
      (input.recentDialogueCount >= 3 && input.sessionMinutesTrend === "INCREASING")
    ) {
      return new FatigueScore("HIGH");
    }

    if (input.recentDialogueCount >= 3 || input.averageSessionMinutes >= 25) {
      return new FatigueScore("MEDIUM");
    }

    return new FatigueScore("LOW");
  }

  needsCooldown(): boolean {
    return this.level === "HIGH";
  }
}
