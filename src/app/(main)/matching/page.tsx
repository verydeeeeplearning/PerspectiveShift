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

  if (!isReady) {
    return <div className="p-6 text-text-secondary">세션 초기화 중...</div>;
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="mb-6 space-y-2">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-text-secondary">
          매칭
        </span>
        <h1 className="text-2xl font-bold font-heading text-text-primary tracking-[-0.02em]">
          대화 상대 찾기
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          당신과 적절한 의견 거리를 가진 상대를 찾아 구조화된 대화를
          시작하세요.
        </p>
      </div>

      {loading && <p className="text-text-tertiary">후보 검색 중...</p>}
      {error && (
        <p className="text-semantic-difference bg-semantic-difference-soft p-3 rounded-chip mb-4">
          {error}
        </p>
      )}

      {!loading && candidates.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <p className="text-lg text-text-primary font-heading">
            지금은 매칭 상대가 없어요
          </p>
          <p className="text-sm text-text-tertiary">
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
              <h2 className="text-xs font-semibold text-text-secondary">다른 후보</h2>
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
