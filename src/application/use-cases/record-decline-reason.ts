import { DeclineReason, type DeclineReasonKey, type DeclineMatchingAdjustment } from "@/domain/value-objects/decline-reason";

export interface DeclineReasonResult {
  reason: DeclineReasonKey;
  label: string;
  adjustment: DeclineMatchingAdjustment;
}

export class RecordDeclineReasonUseCase {
  execute(key: DeclineReasonKey): DeclineReasonResult {
    const reason = DeclineReason.create(key);

    return {
      reason: reason.key,
      label: reason.label,
      adjustment: reason.toMatchingAdjustment(),
    };
  }
}
