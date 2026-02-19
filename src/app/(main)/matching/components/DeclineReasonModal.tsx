"use client";

import { DECLINE_REASONS, type DeclineReasonKey } from "@/domain/value-objects/decline-reason";

interface DeclineReasonModalProps {
  open: boolean;
  onSelect: (key: DeclineReasonKey) => void;
  onClose: () => void;
}

const REASON_LABELS: Record<DeclineReasonKey, string> = {
  TOPIC_HEAVY: "주제가 무거워요",
  NO_TIME: "시간이 없어요",
  NEED_REST: "쉬고 싶어요",
  DIFFERENT_TOPIC: "다른 주제가 좋겠어요",
};

export function DeclineReasonModal({
  open,
  onSelect,
  onClose,
}: DeclineReasonModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="거절 사유 선택"
    >
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <h3 className="mb-4 text-center text-lg font-bold text-gray-900">
          왜 다음에 하고 싶으세요?
        </h3>

        <div className="flex flex-col gap-2">
          {DECLINE_REASONS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              {REASON_LABELS[key]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-2 text-center text-sm text-gray-400 hover:text-gray-600"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
