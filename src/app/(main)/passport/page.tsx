"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PassportBadge } from "@/domain/value-objects/passport-badge";
import { BadgeGrid } from "./_components/BadgeGrid";
import { DiscoveryCardList } from "./_components/DiscoveryCardList";
import {
  SavedPersonaList,
  type SavedPersonaItem,
} from "./_components/SavedPersonaList";

// TODO: 실제 API 연동 시 fetch로 교체
const MOCK_PASSPORT = {
  weeklyExploredCount: 2,
  totalExploredCount: 7,
  discoveredConcepts: [
    "공정한 절차가 반드시 공정한 결과를 보장하지 않는다",
    "효율성과 형평성은 항상 트레이드오프 관계에 있다",
    "자유 의지와 결정론은 양립 가능하다는 시각도 있다",
  ],
};

const MOCK_SAVED_PERSONAS: SavedPersonaItem[] = [
  {
    personaId: "persona-realist",
    name: "현실주의 직장인",
    conversationCount: 4,
    lastConversationAt: "2026-02-19",
  },
  {
    personaId: "persona-educator",
    name: "공감하는 교육자",
    conversationCount: 2,
    lastConversationAt: "2026-02-17",
  },
];

type Tab = "badges" | "discoveries" | "saved-persona";

export default function PassportPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("badges");
  const passport = MOCK_PASSPORT;
  const badges = PassportBadge.evaluateAll(passport.totalExploredCount);
  const savedPersonas = MOCK_SAVED_PERSONAS;

  const handleResumePersona = (personaId: string) => {
    router.push(`/matching?mode=ai-practice&personaId=${personaId}`);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">🗺️ Perspective Passport</h1>
        <p className="mt-1 text-sm text-gray-500">나의 관점 탐색 여정</p>
      </div>

      {/* Stats */}
      <div className="mt-6 flex justify-center gap-8">
        <div className="text-center">
          <p className="text-3xl font-bold text-indigo-600">{passport.weeklyExploredCount}</p>
          <p className="text-xs text-gray-400">이번 주</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">{passport.totalExploredCount}</p>
          <p className="text-xs text-gray-400">누적 탐색</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setTab("badges")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === "badges" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          뱃지
        </button>
        <button
          type="button"
          onClick={() => setTab("discoveries")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === "discoveries" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          발견 목록
        </button>
        <button
          type="button"
          onClick={() => setTab("saved-persona")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === "saved-persona" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          저장 페르소나
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        {tab === "badges" && <BadgeGrid badges={badges} />}
        {tab === "discoveries" && <DiscoveryCardList concepts={passport.discoveredConcepts} />}
        {tab === "saved-persona" && (
          <SavedPersonaList personas={savedPersonas} onResume={handleResumePersona} />
        )}
      </div>
    </div>
  );
}
