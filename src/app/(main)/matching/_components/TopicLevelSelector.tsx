"use client";

import { TOPIC_LEVELS, type TopicLevelKey } from "@/domain/value-objects/topic-level";

interface TopicLevelSelectorProps {
  selectedLevel: number | null;
  onSelect: (level: number) => void;
  maxLevel?: number;
  isFirstDialogue?: boolean;
}

const RISK_COLORS: Record<string, string> = {
  LOW: "border-green-200 bg-green-50",
  MEDIUM: "border-yellow-200 bg-yellow-50",
  HIGH: "border-red-200 bg-red-50",
};

const RISK_BADGES: Record<string, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
};

export function TopicLevelSelector({
  selectedLevel,
  onSelect,
  maxLevel = 2,
  isFirstDialogue = false,
}: TopicLevelSelectorProps) {
  const levels = Object.entries(TOPIC_LEVELS)
    .filter(([key]) => Number(key) <= maxLevel)
    .map(([key, info]) => ({
      level: Number(key) as TopicLevelKey,
      ...info,
    }));

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">
        오늘은 어떤 깊이로 대화할까요?
      </h3>
      {isFirstDialogue && (
        <p className="text-sm text-blue-600">
          첫 대화에서는 Level 0-1을 권장합니다
        </p>
      )}
      <div className="grid gap-3">
        {levels.map(({ level, label, description, risk }) => (
          <button
            key={level}
            onClick={() => onSelect(level)}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              selectedLevel === level
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                : RISK_COLORS[risk]
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">
                Level {level}: {label}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${RISK_BADGES[risk]}`}
              >
                {risk}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
