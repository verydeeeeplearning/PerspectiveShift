import type { DeclineReasonKey, DeclineMatchingAdjustment } from "./decline-reason";

const BADGE_TEXT_MAP: Partial<Record<DeclineReasonKey, string>> = {
  NO_TIME: "조정됨: 오늘은 가볍게(5분)",
  TOPIC_HEAVY: "조정됨: 주제 Level 0",
  NEED_REST: "조정됨: 에너지 절약 모드",
};

export class AdjustmentBadge {
  readonly text: string;
  readonly adjustments: DeclineMatchingAdjustment;

  private constructor(text: string, adjustments: DeclineMatchingAdjustment) {
    this.text = text;
    this.adjustments = { ...adjustments };
  }

  static fromDecline(
    reasonKey: DeclineReasonKey,
    adjustment: DeclineMatchingAdjustment,
  ): AdjustmentBadge | null {
    const text = BADGE_TEXT_MAP[reasonKey];
    if (!text) return null; // DIFFERENT_TOPIC → 배지 없음
    return new AdjustmentBadge(text, adjustment);
  }
}
