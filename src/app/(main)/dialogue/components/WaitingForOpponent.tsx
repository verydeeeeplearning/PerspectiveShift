"use client";

const STEP_LABELS: Record<string, string> = {
  POSITION: "입장",
  QUESTION: "질문",
  ANSWER: "답변",
  REFLECTION: "성찰",
};

interface WaitingForOpponentProps {
  currentStep: string;
}

export function WaitingForOpponent({
  currentStep,
}: WaitingForOpponentProps) {
  const stepLabel = STEP_LABELS[currentStep] ?? currentStep;

  return (
    <div className="text-center py-8 px-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <div className="text-3xl mb-3" aria-hidden="true">
        &#9203;
      </div>
      <h3 className="font-medium text-lg mb-2">
        상대의 {stepLabel}을(를) 기다리고 있습니다
      </h3>
      <p className="text-sm text-gray-600">
        상대가 {stepLabel}을(를) 제출하면 다음 단계로 진행됩니다.
        알림을 받으실 수 있습니다.
      </p>
    </div>
  );
}
