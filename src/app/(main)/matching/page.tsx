"use client";

import { useEffect, useState } from "react";
import { useAnonymousSession } from "@/app/_shared/hooks/useAnonymousSession";
import { apiGet, apiPost } from "@/app/_shared/api-client";
import type { MatchCandidateOutput } from "@/application/dtos/match-output";
import { CandidateList } from "./components/CandidateList";
import { EnergyReactiveMatchCard } from "./components/EnergyReactiveMatchCard";

export default function MatchingPage() {
  const { isReady } = useAnonymousSession();
  const [candidates, setCandidates] = useState<MatchCandidateOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const featuredCandidate = candidates[0] ?? null;
  const secondaryCandidates = featuredCandidate ? candidates.slice(1) : [];

  useEffect(() => {
    if (!isReady) return;
    setLoading(true);
    apiGet<{ candidates: MatchCandidateOutput[] }>("/api/matching/candidates")
      .then((data) => setCandidates(data.candidates))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isReady]);

  const handlePropose = async (targetSessionId: string) => {
    try {
      await apiPost("/api/matching/proposals", { targetSessionId });
      setCandidates((prev) =>
        prev.filter((c) => c.sessionId !== targetSessionId),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "제안 실패");
    }
  };

  const handleDeclineFeatured = () => {
    setCandidates((prev) => prev.slice(1));
  };

  if (!isReady) return <div className="p-6">세션 초기화 중...</div>;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">대화 상대 찾기</h1>
      <p className="text-gray-600 mb-4">
        당신과 적절한 의견 거리를 가진 상대를 찾아 구조화된 대화를
        시작하세요.
      </p>

      {loading && <p className="text-gray-500">후보 검색 중...</p>}
      {error && (
        <p className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</p>
      )}

      {!loading && candidates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">현재 매칭 가능한 후보가 없습니다</p>
          <p className="text-sm">
            다른 참여자가 온보딩을 완료하면 후보가 표시됩니다
          </p>
        </div>
      )}

      {!loading && candidates.length > 0 && featuredCandidate && (
        <section className="space-y-4">
          <EnergyReactiveMatchCard
            candidate={featuredCandidate}
            candidateCount={candidates.length}
            onStart={() => {
              void handlePropose(featuredCandidate.sessionId);
            }}
            onDecline={handleDeclineFeatured}
          />

          {secondaryCandidates.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-700">다른 후보</h2>
              <CandidateList
                candidates={secondaryCandidates}
                onPropose={handlePropose}
              />
            </section>
          )}
        </section>
      )}
    </main>
  );
}
