import { DomainError } from "../errors/domain-errors";

export type EnergyLevelKey = "HIGH" | "NORMAL" | "LOW";

export interface MatchAdjustment {
  distanceDelta: number;
  levelDelta: number;
}

export interface MatchingParams {
  difficultyRange: [number, number];
  distanceBand: [number, number];
  timeBudgetMinutes: number;
  scaffoldingLevel: "minimal" | "moderate" | "high";
}

interface EnergyConfig {
  key: EnergyLevelKey;
  emoji: string;
  label: string;
  matchAdjustment: MatchAdjustment;
  matchingParams: MatchingParams;
}

const ENERGY_CONFIGS: Record<EnergyLevelKey, EnergyConfig> = {
  HIGH: {
    key: "HIGH",
    emoji: "🔋🔋🔋",
    label: "에너지 충만",
    matchAdjustment: { distanceDelta: 0, levelDelta: 0 },
    matchingParams: {
      difficultyRange: [2, 3],
      distanceBand: [0.4, 0.7],
      timeBudgetMinutes: 15,
      scaffoldingLevel: "minimal",
    },
  },
  NORMAL: {
    key: "NORMAL",
    emoji: "🔋🔋",
    label: "보통",
    matchAdjustment: { distanceDelta: 0, levelDelta: 0 },
    matchingParams: {
      difficultyRange: [1, 2],
      distanceBand: [0.2, 0.5],
      timeBudgetMinutes: 10,
      scaffoldingLevel: "moderate",
    },
  },
  LOW: {
    key: "LOW",
    emoji: "🔋",
    label: "오늘은 가볍게",
    matchAdjustment: { distanceDelta: -0.1, levelDelta: -1 },
    matchingParams: {
      difficultyRange: [0, 1],
      distanceBand: [0.0, 0.3],
      timeBudgetMinutes: 5,
      scaffoldingLevel: "high",
    },
  },
};

export class EnergyLevel {
  readonly key: EnergyLevelKey;
  readonly emoji: string;
  readonly label: string;
  readonly matchAdjustment: MatchAdjustment;
  readonly matchingParams: MatchingParams;

  private constructor(config: EnergyConfig) {
    this.key = config.key;
    this.emoji = config.emoji;
    this.label = config.label;
    this.matchAdjustment = config.matchAdjustment;
    this.matchingParams = config.matchingParams;
  }

  static create(key: EnergyLevelKey): EnergyLevel {
    const config = ENERGY_CONFIGS[key];
    if (!config) {
      throw new DomainError(`Invalid energy level: ${key}`);
    }
    return new EnergyLevel(config);
  }

  getMatchingParams(): MatchingParams {
    return this.matchingParams;
  }
}
