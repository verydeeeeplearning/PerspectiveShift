import { DeclineReason, type DeclineReasonKey, type DeclineMatchingAdjustment } from "@/domain/value-objects/decline-reason";
import { AdjustmentBadge } from "@/domain/value-objects/adjustment-badge";

export interface DeclineReasonResult {
  reason: DeclineReasonKey;
  label: string;
  adjustment: DeclineMatchingAdjustment;
  badge: { text: string } | null;
}

export class RecordDeclineReasonUseCase {
  execute(key: DeclineReasonKey): DeclineReasonResult {
    const reason = DeclineReason.create(key);
    const adjustment = reason.toMatchingAdjustment();
    const badge = AdjustmentBadge.fromDecline(key, adjustment);

    return {
      reason: reason.key,
      label: reason.label,
      adjustment,
      badge: badge ? { text: badge.text } : null,
    };
  }
}
