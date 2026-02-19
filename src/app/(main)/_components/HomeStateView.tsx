"use client";

import type { HomeStateType } from "@/domain/value-objects/home-state";
import { SavedQuestionStartCard } from "./SavedQuestionStartCard";

interface SavedQuestion {
  id: string;
  text: string;
}

interface HomeStateViewProps {
  state: HomeStateType;
  lastSummary?: string;
  savedQuestions?: SavedQuestion[];
  onStartWithQuestion?: (questionId: string) => void;
}

const STATE_CONFIG: Record<HomeStateType, { title: string; description: string; cta: string }> = {
  FIRST_VISIT: {
    title: "생각 지도 만들기",
    description: "내 입장을 탐색해보세요",
    cta: "시작하기",
  },
  MAP_COMPLETED: {
    title: "매칭 추천",
    description: "비슷하면서도 다른 상대를 찾아드릴게요",
    cta: "대화 상대 찾기",
  },
  WAITING_MATCH: {
    title: "대화 상대를 찾고 있어요",
    description: "잠시만 기다려 주세요",
    cta: "기다리는 중...",
  },
  POST_DIALOGUE_D1: {
    title: "어제 대화 돌아보기",
    description: "상대의 핵심 발언을 다시 살펴보세요",
    cta: "복기하기",
  },
  HAS_FRIENDS: {
    title: "친구와 가볍게 이야기해요",
    description: "라이트 프로토콜로 짧은 대화를 나눠보세요",
    cta: "대화 시작",
  },
  RETURNING_AFTER_14D: {
    title: "오랜만이에요!",
    description: "그동안 많은 것이 바뀌었을 수도 있어요",
    cta: "다시 시작하기",
  },
};

export default function HomeStateView({ state, lastSummary, savedQuestions, onStartWithQuestion }: HomeStateViewProps) {
  const config = STATE_CONFIG[state];
  return (
    <div className="rounded-xl border p-6 text-center">
      <h2 className="text-xl font-bold">{config.title}</h2>
      <p className="mt-2 text-sm text-gray-500">{config.description}</p>
      <button className="mt-4 rounded bg-indigo-500 px-6 py-2 text-white">
        {config.cta}
      </button>

      {state === "POST_DIALOGUE_D1" && lastSummary && (
        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left">
          <p className="text-xs font-semibold uppercase text-gray-400">최근 요약</p>
          <p className="mt-1 text-sm text-gray-700 line-clamp-3">{lastSummary}</p>
        </div>
      )}

      {savedQuestions && savedQuestions.length > 0 && (
        <div className="mt-4 space-y-2">
          {savedQuestions.slice(0, 2).map((q) => (
            <SavedQuestionStartCard
              key={q.id}
              questionText={q.text}
              onStart={() => onStartWithQuestion?.(q.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
