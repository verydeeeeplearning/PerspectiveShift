"use client";

import { useState } from "react";
import { CORE_VALUES, type CoreValueKey } from "@/domain/value-objects/core-value";

interface SelfAffirmationStepProps {
  onComplete: (coreValue: CoreValueKey, experience?: string) => void;
  onSkip: () => void;
}

const VALUE_ENTRIES = Object.entries(CORE_VALUES) as [CoreValueKey, string][];

export function SelfAffirmationStep({
  onComplete,
  onSkip,
}: SelfAffirmationStepProps) {
  const [selectedValue, setSelectedValue] = useState<CoreValueKey | null>(null);
  const [step, setStep] = useState<"select" | "experience">("select");
  const [experience, setExperience] = useState("");

  const handleValueSelect = (value: CoreValueKey) => {
    setSelectedValue(value);
    setStep("experience");
  };

  const handleSubmit = () => {
    if (!selectedValue) return;
    const trimmed = experience.trim();
    onComplete(selectedValue, trimmed || undefined);
  };

  const handleSkipExperience = () => {
    if (!selectedValue) return;
    onComplete(selectedValue);
  };

  if (step === "experience" && selectedValue) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <h2 className="text-xl font-bold">
          &lsquo;{CORE_VALUES[selectedValue]}&rsquo;에 대한 경험이 있나요?
        </h2>
        <p className="text-center text-sm text-gray-500">
          개인정보는 자동으로 마스킹됩니다. 짧은 한 줄이면 충분해요.
        </p>
        <textarea
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="예: 팀원이 힘들어할 때 먼저 다가간 경험"
          maxLength={500}
          className="w-full max-w-md rounded-lg border border-gray-300 p-3 text-sm"
          rows={3}
          aria-label="경험 입력"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            다음
          </button>
          <button
            type="button"
            onClick={handleSkipExperience}
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            건너뛰기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h2 className="text-xl font-bold">대화 준비 운동</h2>
      <p className="text-center text-sm text-gray-500">
        당신을 바꾸려는 게 아니에요. 당신이 어떤 사람인지 먼저 확인하는 과정이에요.
      </p>
      <p className="text-center text-gray-600">
        나에게 가장 중요한 가치를 하나 골라주세요
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {VALUE_ENTRIES.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleValueSelect(key)}
            className={`rounded-xl border-2 px-4 py-3 text-center transition-all ${
              selectedValue === key
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            }`}
            aria-label={`가치 선택: ${label}`}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="mt-2 text-sm text-gray-400 underline hover:text-gray-600"
      >
        건너뛰기 →
      </button>
    </div>
  );
}
