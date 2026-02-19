"use client";

import { useState } from "react";
import {
  REFLECTION_TYPES,
  type ReflectionType,
} from "@/domain/value-objects/reflection-item";

interface ReflectionFormProps {
  onSubmit: (items: { type: ReflectionType; content: string }[]) => void;
  isSubmitting?: boolean;
}

const TYPE_LABELS: Record<ReflectionType, { label: string; placeholder: string; required: boolean }> = {
  SUMMARY: {
    label: "R1: 상대 입장 요약",
    placeholder: "상대의 핵심 주장을 한두 문장으로 요약해주세요 (필수)",
    required: true,
  },
  ACCURACY_CHECK: {
    label: "R2: 정확성 확인",
    placeholder: "요약이 맞나요? 수정할 부분이 있다면 적어주세요 (필수)",
    required: true,
  },
  STEELMAN: {
    label: "R3: 상대 관점의 가장 강한 논거",
    placeholder: "상대 입장에서 가장 설득력 있는 주장은 무엇일까요?",
    required: false,
  },
  COMMON_GROUND: {
    label: "R4: 공통점",
    placeholder: "서로 동의하는 부분이 있다면 적어주세요",
    required: false,
  },
  FUTURE_QUESTION: {
    label: "R5: 더 알고 싶은 질문",
    placeholder: "다음에 더 이야기하고 싶은 질문이 있다면 적어주세요",
    required: false,
  },
};

export function ReflectionForm({ onSubmit, isSubmitting }: ReflectionFormProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(REFLECTION_TYPES.map((t) => [t, ""])),
  );

  const canSubmit =
    values.SUMMARY.trim().length > 0 &&
    values.ACCURACY_CHECK.trim().length > 0;

  const handleSubmit = () => {
    const items = REFLECTION_TYPES
      .filter((type) => values[type].trim().length > 0)
      .map((type) => ({ type, content: values[type].trim() }));
    onSubmit(items);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">성찰하기</h3>

      {REFLECTION_TYPES.map((type) => {
        const info = TYPE_LABELS[type];
        return (
          <div key={type} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {info.label}
              {info.required && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </label>
            <textarea
              value={values[type]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [type]: e.target.value }))
              }
              placeholder={info.placeholder}
              rows={2}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        );
      })}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? "제출 중..." : "성찰 제출"}
      </button>
    </div>
  );
}
