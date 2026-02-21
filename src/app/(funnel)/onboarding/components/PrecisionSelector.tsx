"use client";

import {
  QUESTION_PRECISION_CONFIG,
  type QuestionPrecision,
} from "@/domain/value-objects/question-precision";

interface PrecisionSelectorProps {
  selectedPrecision?: QuestionPrecision | null;
  onSelect: (precision: QuestionPrecision) => void;
  onClose?: () => void;
  showQuickUpsell?: boolean;
  onQuickUpsellUpgrade?: () => void;
  onQuickUpsellKeepQuick?: () => void;
}

const PRECISION_ORDER: QuestionPrecision[] = ["lite", "standard", "deep", "comprehensive"];

export function PrecisionSelector({
  selectedPrecision = null,
  onSelect,
  onClose,
  showQuickUpsell = false,
  onQuickUpsellUpgrade,
  onQuickUpsellKeepQuick,
}: PrecisionSelectorProps) {
  return (
    <section
      className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      aria-label="정밀도 선택"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900">정밀도 사다리 선택</h2>
        <p className="text-sm text-gray-600">
          시작 후에도 상단 <span className="font-semibold">[변경]</span>으로 조절할 수
          있어요.
        </p>
      </div>

      <div className="grid gap-3">
        {PRECISION_ORDER.map((precision) => {
          const config = QUESTION_PRECISION_CONFIG[precision];
          const isSelected = selectedPrecision === precision;
          const isRecommended = precision === "standard";

          return (
            <button
              key={precision}
              type="button"
              onClick={() => onSelect(precision)}
              className={`relative rounded-xl border px-4 py-4 text-left transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/40"
              }`}
            >
              {isRecommended && (
                <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                  추천
                </span>
              )}
              <p className="text-base font-semibold text-gray-900">{config.label}</p>
              <p className="mt-1 text-sm text-gray-600">
                {config.totalQuestions}문항 · 약 {config.estimatedMinutes}분
              </p>
              {precision === "lite" && (
                <p className="mt-1 text-xs font-medium text-blue-700">
                  3분이면 충분해요
                </p>
              )}
            </button>
          );
        })}
      </div>

      {showQuickUpsell && onQuickUpsellUpgrade && onQuickUpsellKeepQuick && (
        <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">
            더 정확한 결과를 원하시면?
          </p>
          <p className="text-xs text-blue-800">
            추가 10문항만 더 답하면 정밀도가 크게 올라가요.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onQuickUpsellUpgrade}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              10문항 더 할래요
            </button>
            <button
              type="button"
              onClick={onQuickUpsellKeepQuick}
              className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              지금 결과 보기
            </button>
          </div>
        </div>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 underline underline-offset-2"
        >
          취소
        </button>
      )}
    </section>
  );
}
