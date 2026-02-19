"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ThoughtMapOutput } from "@/application/dtos/thought-map-output";
import { ThoughtMapChart } from "./ThoughtMapChart";
import { TypeAlias } from "./TypeAlias";
import { AliasCard } from "./AliasCard";
import { PercentileDisplay } from "./PercentileDisplay";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import { GetContextualRecommendationsUseCase } from "@/application/use-cases/get-contextual-recommendations";
import type { RecommendationType } from "@/domain/value-objects/contextual-recommendation";
import { ShareCard } from "../result/components/ShareCard";

interface ThoughtMapResultProps {
  data: ThoughtMapOutput;
  onEvent?: (eventName: ThoughtMapEventName) => void;
}

export type ThoughtMapEventName =
  | "thought_map_view"
  | "thought_map_cta_match_click"
  | "thought_map_share_click"
  | "thought_map_precision_upsell"
  | "thought_map_ai_practice_click";

const RECOMMENDATION_LABELS: Record<RecommendationType, string> = {
  precision_upsell: "정밀도 높이기",
  ai_practice: "AI 연습 대화",
  misperception: "오해 교정 보기",
  share_card: "유형 카드 공유",
};

export function ThoughtMapResult({ data, onEvent }: ThoughtMapResultProps) {
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);
  const [isMisperceptionHintOpen, setIsMisperceptionHintOpen] = useState(false);

  const emitEvent = useCallback(
    (eventName: ThoughtMapEventName) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("perspectiveshift:analytics", {
            detail: {
              type: eventName,
              payload: { timestamp: Date.now() },
            },
          }),
        );
      }
      onEvent?.(eventName);
    },
    [onEvent],
  );

  useEffect(() => {
    emitEvent("thought_map_view");
  }, [emitEvent]);

  const recommendations = useMemo(() => {
    const useCase = new GetContextualRecommendationsUseCase();
    return useCase.execute({
      isLowPrecision: data.precision === "initial",
      hasHumanMatchPool: data.precision === "refined",
      hasMisperceptionTarget: data.percentiles.some(
        (percentile) => percentile.percentile <= 30 || percentile.percentile >= 70,
      ),
    });
  }, [data.percentiles, data.precision]);

  const handleRecommendationClick = (type: RecommendationType) => {
    if (type === "precision_upsell") {
      emitEvent("thought_map_precision_upsell");
      return;
    }
    if (type === "ai_practice") {
      emitEvent("thought_map_ai_practice_click");
      return;
    }
    if (type === "misperception") {
      setIsMisperceptionHintOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <TypeAlias mapType={data.mapType} />

      {data.alias && <AliasCard alias={data.alias} />}

      <ThoughtMapChart
        vector={data.vector as Record<StanceDimension, number>}
      />

      <PercentileDisplay percentiles={data.percentiles} />

      <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
        <p>
          {data.precision === "refined"
            ? "확장 질문 포함 정밀 프로필"
            : "핵심 질문 기반 초기 프로필"}
        </p>
        <p className="mt-1">{data.baselineLabel}</p>
      </div>

      {data.precision === "initial" && (
        <Link
          href="/onboarding"
          onClick={() => emitEvent("thought_map_precision_upsell")}
          className="block rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-center text-sm font-semibold text-blue-700 hover:bg-blue-100"
        >
          정밀도 높이기: 추가 질문으로 결과를 더 정확하게 만들기
        </Link>
      )}

      <Link
        href="/matching"
        onClick={() => emitEvent("thought_map_cta_match_click")}
        className="block rounded-xl bg-blue-600 px-6 py-4 text-center text-lg font-bold text-white shadow-md transition-colors hover:bg-blue-700"
      >
        대화 상대 찾기
      </Link>

      <details
        open={isRecommendationOpen}
        onToggle={(event) =>
          setIsRecommendationOpen((event.currentTarget as HTMLDetailsElement).open)
        }
        className="rounded-xl border border-gray-200 bg-white p-4"
      >
        <summary className="cursor-pointer text-sm font-semibold text-gray-800">
          상황 기반 추천 보기
        </summary>
        <div className="mt-3 space-y-2">
          {recommendations.map((recommendation) => {
            if (recommendation.type === "share_card") {
              return (
                <div key={recommendation.type}>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    {RECOMMENDATION_LABELS[recommendation.type]}
                  </p>
                  <ShareCard
                    data={data}
                    onShare={() => emitEvent("thought_map_share_click")}
                  />
                </div>
              );
            }

            if (recommendation.type === "precision_upsell") {
              return (
                <Link
                  key={recommendation.type}
                  href="/onboarding"
                  onClick={() => handleRecommendationClick(recommendation.type)}
                  className="block rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100"
                >
                  {RECOMMENDATION_LABELS[recommendation.type]}
                </Link>
              );
            }

            if (recommendation.type === "ai_practice") {
              return (
                <Link
                  key={recommendation.type}
                  href="/matching?mode=ai-practice"
                  onClick={() => handleRecommendationClick(recommendation.type)}
                  className="block rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  {RECOMMENDATION_LABELS[recommendation.type]}
                </Link>
              );
            }

            return (
              <button
                key={recommendation.type}
                type="button"
                onClick={() => handleRecommendationClick(recommendation.type)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {RECOMMENDATION_LABELS[recommendation.type]}
              </button>
            );
          })}

          {isMisperceptionHintOpen && (
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              오해 교정 카드는 다음 단계에서 상대 예측과 실제 분포의 간극을 보여줍니다.
            </p>
          )}
        </div>
      </details>
    </div>
  );
}
