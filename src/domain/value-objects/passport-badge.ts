export type BadgeType = "OBSERVER" | "LISTENER" | "EXPLORER";

interface BadgeConfig {
  type: BadgeType;
  label: string;
  emoji: string;
  description: string;
  requiredCount: number;
}

const BADGE_CONFIGS: Record<BadgeType, BadgeConfig> = {
  OBSERVER: {
    type: "OBSERVER",
    label: "관찰자",
    emoji: "👁️",
    description: "3개 이상의 새로운 관점을 발견했어요",
    requiredCount: 3,
  },
  LISTENER: {
    type: "LISTENER",
    label: "경청가",
    emoji: "👂",
    description: "10개 이상의 새로운 관점을 발견했어요",
    requiredCount: 10,
  },
  EXPLORER: {
    type: "EXPLORER",
    label: "탐색가",
    emoji: "🧭",
    description: "25개 이상의 새로운 관점을 발견했어요",
    requiredCount: 25,
  },
};

export class PassportBadge {
  readonly type: BadgeType;
  readonly label: string;
  readonly emoji: string;
  readonly description: string;
  readonly isUnlocked: boolean;

  private constructor(config: BadgeConfig, unlocked: boolean) {
    this.type = config.type;
    this.label = config.label;
    this.emoji = config.emoji;
    this.description = config.description;
    this.isUnlocked = unlocked;
  }

  static evaluateAll(totalExploredCount: number): PassportBadge[] {
    return (Object.values(BADGE_CONFIGS) as BadgeConfig[]).map(
      (config) => new PassportBadge(config, totalExploredCount >= config.requiredCount),
    );
  }
}
