"use client";

import { PrecisionSelector } from "./PrecisionSelector";
import type { AnswerMap } from "./onboarding-flow.helpers";
import type { QuestionPrecision } from "@/domain/value-objects/question-precision";

interface OnboardingQuickUpsellProps {
  precision: QuestionPrecision;
  quickUpsellAnswers: AnswerMap;
  onSelectPrecision: (precision: QuestionPrecision) => void;
  onCompleteQuick: (answers: AnswerMap) => void;
  onClose: () => void;
}

export function OnboardingQuickUpsell({
  precision,
  quickUpsellAnswers,
  onSelectPrecision,
  onCompleteQuick,
  onClose,
}: OnboardingQuickUpsellProps) {
  return (
    <PrecisionSelector
      selectedPrecision={precision}
      onSelect={onSelectPrecision}
      showQuickUpsell
      onQuickUpsellUpgrade={() => onSelectPrecision("standard")}
      onQuickUpsellKeepQuick={() => {
        onCompleteQuick(quickUpsellAnswers);
        onClose();
      }}
    />
  );
}
