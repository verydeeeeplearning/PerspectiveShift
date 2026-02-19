"use client";

import type { ShareCardOutput } from "@/application/use-cases/generate-share-card";
import { DIMENSION_LABELS } from "@/domain/value-objects/stance-dimension";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

interface ShareCardPreviewProps {
  card: ShareCardOutput;
  onShare: () => void;
}

export function ShareCardPreview({ card, onShare }: ShareCardPreviewProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {card.type === "ALIAS" && card.alias && (
        <div className="text-center">
          <span className="text-4xl">{card.alias.emoji}</span>
          <h3 className="mt-2 text-xl font-bold text-gray-900">
            {card.alias.label}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {card.alias.description}
          </p>
          {card.topDimensions && card.topDimensions.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {card.topDimensions.map((dim) => (
                <span
                  key={dim}
                  className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {DIMENSION_LABELS[dim as StanceDimension] ?? dim}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {card.type === "THOUGHT_MAP" && card.vectorSubset && (
        <div>
          <h3 className="mb-3 text-center text-lg font-bold text-gray-900">
            Thought Map
          </h3>
          <div className="space-y-3">
            {card.selectedAxes?.map((axis) => {
              const value = card.vectorSubset![axis as StanceDimension] ?? 0;
              const pct = Math.round(value * 100);
              return (
                <div key={axis}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600">
                      {DIMENSION_LABELS[axis as StanceDimension] ?? axis}
                    </span>
                    <span className="font-medium text-gray-900">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {card.type === "MISPERCEPTION" && card.misperception && (
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">
            {DIMENSION_LABELS[card.misperception.dimension] ?? card.misperception.dimension}
          </h3>
          <div className="mt-3 flex justify-center gap-6">
            <div>
              <p className="text-sm text-gray-500">내 예측</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(card.misperception.userPrediction * 100)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">실제</p>
              <p className="text-2xl font-bold text-emerald-600">
                {Math.round(card.misperception.actualBaseline * 100)}%
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {card.misperception.baselineLabel}
          </p>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-gray-400">
        {card.privacyDisclaimer}
      </p>

      <button
        type="button"
        onClick={onShare}
        aria-label="공유하기"
        className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        공유하기
      </button>
    </div>
  );
}
