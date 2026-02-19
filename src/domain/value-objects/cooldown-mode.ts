export type CooldownReason = "FATIGUE" | "DAILY_LIMIT" | "USER_REQUEST";

const SUGGESTED_ACTIVITIES: Record<CooldownReason, string> = {
  FATIGUE: "Thought Map을 다시 살펴보며 자신의 생각을 정리해보세요",
  DAILY_LIMIT: "과거 대화 하이라이트를 돌아보며 새로운 관점을 발견해보세요",
  USER_REQUEST: "자신만의 속도로 쉬어가세요. 내일 다시 만나요",
};

export class CooldownMode {
  readonly active: boolean;
  readonly reason: CooldownReason | null;
  readonly suggestedActivity: string;

  private constructor(active: boolean, reason: CooldownReason | null) {
    this.active = active;
    this.reason = reason;
    this.suggestedActivity = reason ? SUGGESTED_ACTIVITIES[reason] : "";
  }

  static activate(reason: CooldownReason): CooldownMode {
    return new CooldownMode(true, reason);
  }

  static inactive(): CooldownMode {
    return new CooldownMode(false, null);
  }
}
