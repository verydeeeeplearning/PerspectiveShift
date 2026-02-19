"use client";

import { EFFORT_GRADES, type EffortGradeKey } from "@/domain/value-objects/effort-grade";

interface EffortGradeSelectorProps {
  selectedGrade: EffortGradeKey | null;
  onSelect: (grade: EffortGradeKey) => void;
}

const GRADE_ICONS: Record<EffortGradeKey, string> = {
  QUICK: "\u26A1",
  STRUCTURED: "\uD83D\uDCCB",
  DEEP: "\uD83E\uDDD8",
};

export function EffortGradeSelector({
  selectedGrade,
  onSelect,
}: EffortGradeSelectorProps) {
  const grades = Object.entries(EFFORT_GRADES).map(([key, info]) => ({
    key: key as EffortGradeKey,
    ...info,
  }));

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">
        대화 시간을 선택하세요
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {grades.map(({ key, label, description, durationMinutes, stepCount }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex flex-col items-center rounded-xl border-2 p-4 transition-all ${
              selectedGrade === key
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span className="text-2xl">{GRADE_ICONS[key]}</span>
            <span className="mt-2 font-medium text-gray-900">{label}</span>
            <span className="mt-1 text-sm text-gray-500">
              {durationMinutes}분 / {stepCount}단계
            </span>
            <p className="mt-1 text-xs text-gray-400">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
