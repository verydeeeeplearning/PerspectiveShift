"use client";

interface OnboardingEmptyExtendedProps {
  onSkipExtended: () => void;
}

export function OnboardingEmptyExtended({ onSkipExtended }: OnboardingEmptyExtendedProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <p className="text-sm text-gray-600">
        확장 질문이 없습니다. 현재 결과로 진행할 수 있어요.
      </p>
      <button
        type="button"
        onClick={onSkipExtended}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
      >
        결과 보기
      </button>
    </div>
  );
}
