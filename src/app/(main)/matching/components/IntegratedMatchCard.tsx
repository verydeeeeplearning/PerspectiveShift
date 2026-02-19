"use client";

import { type EnergyLevelKey } from "@/domain/value-objects/energy-level";

interface IntegratedMatchCardProps {
  topic: string;
  energy: EnergyLevelKey;
  trailerLine1: string;
  trailerLine2: string;
  trailerLine3?: string | null;
  distanceLabel: string;
  distanceDots: number;
  difficultyLevel: number;
  timeBudgetMinutes: number;
  ctaCopy: string;
  declineBadge?: { text: string } | null;
  onStartDialogue: () => void;
  onDecline: () => void;
}

export function IntegratedMatchCard({
  topic,
  energy,
  trailerLine1,
  trailerLine2,
  trailerLine3,
  distanceLabel,
  distanceDots,
  difficultyLevel,
  timeBudgetMinutes,
  ctaCopy,
  declineBadge,
  onStartDialogue,
  onDecline,
}: IntegratedMatchCardProps) {
  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      role="article"
      aria-label="매칭 카드"
      data-energy={energy}
    >
      {/* Decline Badge */}
      {declineBadge && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
          <span className="text-xs text-amber-700 font-medium">
            {declineBadge.text}
          </span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Topic */}
        <div>
          <span className="text-xs text-gray-400">주제</span>
          <h3 className="font-semibold text-gray-900">{topic}</h3>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <span className="text-xs text-gray-400 block">거리</span>
            <span className="font-medium">
              {"●".repeat(distanceDots)}
              {"○".repeat(5 - distanceDots)}
            </span>
            <span className="text-xs text-gray-500 block">{distanceLabel}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">난이도</span>
            <span className="font-medium">Level {difficultyLevel}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">예상 시간</span>
            <span className="font-medium">{timeBudgetMinutes}분</span>
          </div>
        </div>

        {/* Trailer */}
        <div className="bg-gray-50 rounded-xl p-3">
          <span className="text-xs text-gray-400 block mb-1">
            상대방 미리보기
          </span>
          <p className="text-sm text-gray-700">{trailerLine1}</p>
          <p className="text-sm text-gray-700">{trailerLine2}</p>
          {trailerLine3 && (
            <p className="text-sm text-gray-500 mt-1">{trailerLine3}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium"
            onClick={onStartDialogue}
            aria-label={ctaCopy}
          >
            {ctaCopy}
          </button>
          <button
            className="px-4 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm"
            onClick={onDecline}
            aria-label="다른 상대"
          >
            다른 상대
          </button>
        </div>
      </div>
    </div>
  );
}
