"use client";

import {
  ONBOARDING_MODES,
  type OnboardingModeKey,
} from "@/domain/value-objects/onboarding-mode";

interface ModeSelectorProps {
  onSelect: (mode: OnboardingModeKey) => void;
}

const MODE_KEYS: OnboardingModeKey[] = ["LITE", "STANDARD", "DEEP", "COMPREHENSIVE"];

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      {MODE_KEYS.map((key) => {
        const mode = ONBOARDING_MODES[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`relative rounded-xl border-2 p-5 text-left transition-all hover:border-blue-500 hover:shadow-md ${
              mode.isRecommended
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
          >
            {mode.isRecommended && (
              <span className="absolute -top-2.5 right-4 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                추천
              </span>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {mode.label}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {mode.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-blue-600">
                  {mode.questionCount}문항
                </p>
                <p className="text-sm text-gray-500">
                  약 {mode.estimatedMinutes}분
                </p>
              </div>
            </div>

            {key === "COMPREHENSIVE" && (
              <p className="mt-2 text-xs text-blue-700">
                종합 분석으로 매칭 품질이 향상됩니다
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
