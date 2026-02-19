import { DomainError } from "../errors/domain-errors";

export class InvalidTopicLevelError extends DomainError {
  constructor(value: number) {
    super(`Topic level must be an integer between 0 and 3, got ${value}`);
  }
}

export const TOPIC_LEVELS = {
  0: {
    label: "일상 가치/경험",
    description: "일상 속 경험이나 가벼운 가치관 이야기",
    risk: "LOW" as const,
    suitableFor: "모든 사용자",
  },
  1: {
    label: "정책 메커니즘",
    description: "구체적인 정책이나 사회 시스템에 대한 토론",
    risk: "LOW" as const,
    suitableFor: "기본 대화 경험이 있는 사용자",
  },
  2: {
    label: "가치 충돌",
    description: "서로 다른 가치가 충돌하는 주제에 대한 토론",
    risk: "MEDIUM" as const,
    suitableFor: "대화 경험이 풍부한 사용자",
  },
  3: {
    label: "정체성 직결",
    description: "정체성과 직결된 민감한 주제에 대한 심층 토론",
    risk: "HIGH" as const,
    suitableFor: "숙련된 사용자 (조건부 노출)",
  },
} as const;

export type TopicLevelKey = keyof typeof TOPIC_LEVELS;

export class TopicLevel {
  readonly level: TopicLevelKey;
  readonly label: string;
  readonly description: string;
  readonly risk: "LOW" | "MEDIUM" | "HIGH";
  readonly suitableFor: string;

  private constructor(level: TopicLevelKey) {
    const info = TOPIC_LEVELS[level];
    this.level = level;
    this.label = info.label;
    this.description = info.description;
    this.risk = info.risk;
    this.suitableFor = info.suitableFor;
  }

  static create(level: number): TopicLevel {
    if (!Number.isInteger(level) || level < 0 || level > 3) {
      throw new InvalidTopicLevelError(level);
    }
    return new TopicLevel(level as TopicLevelKey);
  }

  isAllowedIn(minLevel: number, maxLevel: number): boolean {
    return this.level >= minLevel && this.level <= maxLevel;
  }

  equals(other: TopicLevel): boolean {
    return this.level === other.level;
  }
}
