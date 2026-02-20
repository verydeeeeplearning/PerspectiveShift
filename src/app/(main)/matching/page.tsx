"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAnonymousSession } from "@/app/_shared/hooks/useAnonymousSession";
import { apiGet, apiPost } from "@/app/_shared/api-client";
import type { MatchCandidateOutput } from "@/application/dtos/match-output";
import { CandidateList } from "./components/CandidateList";
import { EnergyReactiveMatchCard } from "./components/EnergyReactiveMatchCard";
import { PersonaSelector } from "./components/PersonaSelector";
import { MatchCardSkeleton } from "@/app/_shared/components/Skeleton";
import { AnimatedListItem } from "@/app/_shared/components/AnimatedList";

interface PersonaCard {
  id: string;
  name: string;
  ageGroup: string;
  jobCategory: string;
  stanceLabel: string;
  description: string;
}

export default function MatchingPage() {
  const { isReady } = useAnonymousSession();
  const [candidates, setCandidates] = useState<MatchCandidateOutput[]>([]);
  const [personas, setPersonas] = useState<PersonaCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const featuredCandidate = candidates[0] ?? null;
  const secondaryCandidates = featuredCandidate ? candidates.slice(1) : [];

  useEffect(() => {
    if (!isReady) return;
    setLoading(true);

    // Fetch human candidates and AI personas in parallel
    Promise.all([
      apiGet<{ candidates: MatchCandidateOutput[] }>("/api/matching/candidates")
        .then((data) => data.candidates)
        .catch(() => [] as MatchCandidateOutput[]),
      fetch("/api/matching/personas")
        .then((res) => res.json())
        .then((data: { personas: PersonaCard[] }) => data.personas)
        .catch(() => [] as PersonaCard[]),
    ])
      .then(([humanCandidates, aiPersonas]) => {
        setCandidates(humanCandidates);
        setPersonas(aiPersonas);
      })
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

  const handleSelectPersona = async (personaId: string) => {
    try {
      const session = await apiPost<{ id: string }>("/api/dialogue/sessions", {
        candidateType: "agent",
        personaId,
      });
      window.location.href = `/dialogue/${session.id}`;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "대화를 시작하는 데 실패했습니다",
      );
    }
  };

  if (!isReady) {
    return (
      <main className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="space-y-2">
          <div className="skeleton h-7 w-40" />
          <div className="skeleton h-4 w-64" />
        </div>
        <MatchCardSkeleton />
      </main>
    );
  }

  const showPersonaFallback = !loading && candidates.length === 0 && personas.length > 0;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      {/* Page header */}
      <motion.div
        className="mb-6 space-y-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold font-heading text-text-primary tracking-[-0.02em]">
          대화 상대 찾기
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          당신과 적절한 의견 거리를 가진 상대를 찾아 구조화된 대화를
          시작하세요.
        </p>
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </div>
      )}

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-semantic-difference-soft border border-semantic-difference/20 text-semantic-difference p-4 rounded-card mb-4"
        >
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* AI Persona fallback when no human candidates */}
      {showPersonaFallback && (
        <PersonaSelector
          personas={personas}
          onSelect={handleSelectPersona}
        />
      )}

      {/* Empty state — no candidates AND no personas */}
      {!loading && candidates.length === 0 && personas.length === 0 && !error && (
        <motion.div
          className="text-center py-16 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-primary-soft flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </div>
          <p className="text-lg text-text-primary font-heading font-semibold">
            지금은 매칭 상대가 없어요
          </p>
          <p className="text-sm text-text-tertiary">
            다른 참여자가 온보딩을 완료하면 후보가 표시됩니다
          </p>
        </motion.div>
      )}

      {/* Human Candidates */}
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
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                다른 후보
              </h2>
              {secondaryCandidates.map((c, idx) => (
                <AnimatedListItem key={c.sessionId} index={idx}>
                  <CandidateList
                    candidates={[c]}
                    onPropose={(candidate) => handlePropose(candidate.sessionId)}
                  />
                </AnimatedListItem>
              ))}
            </section>
          )}
        </section>
      )}
    </main>
  );
}
