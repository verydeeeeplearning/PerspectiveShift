type DistanceLevel = "SLIGHT" | "MODERATE" | "MEANINGFUL" | "CHALLENGING" | "DISABLED";

interface LevelConfig {
  level: DistanceLevel;
  emoji: string;
  shortText: string;
  description: string;
  minDistance: number;
  maxDistance: number;
}

const LEVEL_CONFIGS: readonly LevelConfig[] = [
  { level: "SLIGHT", emoji: "🌱", shortText: "살짝 다른", description: "비슷한 전제, 다른 결론", minDistance: 0, maxDistance: 0.2 },
  { level: "MODERATE", emoji: "🌊", shortText: "적당한 차이", description: "한두 축에서 뚜렷이 다름", minDistance: 0.2, maxDistance: 0.4 },
  { level: "MEANINGFUL", emoji: "⛰️", shortText: "의미있는 차이", description: "여러 축에서 다름", minDistance: 0.4, maxDistance: 0.6 },
  { level: "CHALLENGING", emoji: "🌋", shortText: "도전적 차이", description: "핵심 가치에서 다름", minDistance: 0.6, maxDistance: 0.8 },
  { level: "DISABLED", emoji: "⛔", shortText: "비활성화", description: "매칭 불가 거리", minDistance: 0.8, maxDistance: 1.0 },
];

export class OpinionDistanceLabel {
  readonly level: DistanceLevel;
  readonly emoji: string;
  readonly shortText: string;
  readonly description: string;

  private constructor(config: LevelConfig) {
    this.level = config.level;
    this.emoji = config.emoji;
    this.shortText = config.shortText;
    this.description = config.description;
  }

  get isDisabled(): boolean {
    return this.level === "DISABLED";
  }

  static fromDistance(distance: number): OpinionDistanceLabel {
    const clamped = Math.max(0, Math.min(1, distance));

    for (let i = LEVEL_CONFIGS.length - 1; i >= 0; i--) {
      if (clamped >= LEVEL_CONFIGS[i].minDistance) {
        return new OpinionDistanceLabel(LEVEL_CONFIGS[i]);
      }
    }

    return new OpinionDistanceLabel(LEVEL_CONFIGS[0]);
  }
}
