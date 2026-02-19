import { DomainError } from "../errors/domain-errors";

export type DeclineReasonKey = "TOPIC_HEAVY" | "NO_TIME" | "NEED_REST" | "DIFFERENT_TOPIC";

export interface DeclineMatchingAdjustment {
  distanceDelta: number;
  levelDelta: number;
  changeTopicFlag: boolean;
}

interface ReasonConfig {
  key: DeclineReasonKey;
  label: string;
  adjustment: DeclineMatchingAdjustment;
}

const REASON_CONFIGS: Record<DeclineReasonKey, ReasonConfig> = {
  TOPIC_HEAVY: {
    key: "TOPIC_HEAVY",
    label: "주제가 무거워요",
    adjustment: { distanceDelta: -0.1, levelDelta: -1, changeTopicFlag: false },
  },
  NO_TIME: {
    key: "NO_TIME",
    label: "시간이 없어요",
    adjustment: { distanceDelta: 0, levelDelta: 0, changeTopicFlag: false },
  },
  NEED_REST: {
    key: "NEED_REST",
    label: "쉬고 싶어요",
    adjustment: { distanceDelta: -0.1, levelDelta: -1, changeTopicFlag: false },
  },
  DIFFERENT_TOPIC: {
    key: "DIFFERENT_TOPIC",
    label: "다른 주제가 좋겠어요",
    adjustment: { distanceDelta: 0, levelDelta: 0, changeTopicFlag: true },
  },
};

export const DECLINE_REASONS: readonly DeclineReasonKey[] = Object.keys(REASON_CONFIGS) as DeclineReasonKey[];

export class DeclineReason {
  readonly key: DeclineReasonKey;
  readonly label: string;
  private readonly _adjustment: DeclineMatchingAdjustment;

  private constructor(config: ReasonConfig) {
    this.key = config.key;
    this.label = config.label;
    this._adjustment = config.adjustment;
  }

  static create(key: DeclineReasonKey): DeclineReason {
    const config = REASON_CONFIGS[key];
    if (!config) {
      throw new DomainError(`Invalid decline reason: ${key}`);
    }
    return new DeclineReason(config);
  }

  toMatchingAdjustment(): DeclineMatchingAdjustment {
    return { ...this._adjustment };
  }
}
