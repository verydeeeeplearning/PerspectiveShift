import { DomainError } from "../errors/domain-errors";

export type EnergyLevelKey = "HIGH" | "NORMAL" | "LOW";

export interface MatchAdjustment {
  distanceDelta: number;
  levelDelta: number;
}

interface EnergyConfig {
  key: EnergyLevelKey;
  emoji: string;
  label: string;
  matchAdjustment: MatchAdjustment;
}

const ENERGY_CONFIGS: Record<EnergyLevelKey, EnergyConfig> = {
  HIGH: { key: "HIGH", emoji: "🔋🔋🔋", label: "에너지 충만", matchAdjustment: { distanceDelta: 0, levelDelta: 0 } },
  NORMAL: { key: "NORMAL", emoji: "🔋", label: "보통", matchAdjustment: { distanceDelta: 0, levelDelta: 0 } },
  LOW: { key: "LOW", emoji: "🪫", label: "오늘은 가볍게", matchAdjustment: { distanceDelta: -0.1, levelDelta: -1 } },
};

export class EnergyLevel {
  readonly key: EnergyLevelKey;
  readonly emoji: string;
  readonly label: string;
  readonly matchAdjustment: MatchAdjustment;

  private constructor(config: EnergyConfig) {
    this.key = config.key;
    this.emoji = config.emoji;
    this.label = config.label;
    this.matchAdjustment = config.matchAdjustment;
  }

  static create(key: EnergyLevelKey): EnergyLevel {
    const config = ENERGY_CONFIGS[key];
    if (!config) {
      throw new DomainError(`Invalid energy level: ${key}`);
    }
    return new EnergyLevel(config);
  }
}
