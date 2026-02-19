"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFlow, type AnswerMap } from "./components/OnboardingFlow";
import { TrustMoment } from "./components/TrustMoment";
import { calculateStance } from "./actions";
import type { ThoughtMapOutput } from "@/application/dtos/thought-map-output";
import questionsData from "@/infrastructure/external/data/questions.json";

export default function OnboardingPage() {
  const router = useRouter();
  const [hasSeenTrustMoment, setHasSeenTrustMoment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThoughtMapOutput | null>(null);

  const sessionId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("onboarding_session") ||
        (() => {
          const id = crypto.randomUUID();
          sessionStorage.setItem("onboarding_session", id);
          return id;
        })()
      : "server-render";

  const handleCoreComplete = useCallback(
    async (answers: AnswerMap) => {
      setLoading(true);
      try {
        const output = await calculateStance(sessionId, answers);
        setResult(output);
      } catch (error) {
        console.error("Failed to calculate stance:", error);
      } finally {
        setLoading(false);
      }
    },
    [sessionId],
  );

  const handleExtendedComplete = useCallback(
    async (answers: AnswerMap) => {
      setLoading(true);
      try {
        const output = await calculateStance(sessionId, answers);
        setResult(output);
      } catch (error) {
        console.error("Failed to calculate stance:", error);
      } finally {
        setLoading(false);
      }
    },
    [sessionId],
  );

  const handleSkipExtended = useCallback(() => {
    if (result) {
      router.push(
        `/onboarding/result?data=${encodeURIComponent(JSON.stringify(result))}`,
      );
    }
  }, [result, router]);

  useEffect(() => {
    if (result) {
      router.push(
        `/onboarding/result?data=${encodeURIComponent(JSON.stringify(result))}`,
      );
    }
  }, [result, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-border-soft border-t-indigo-depth" />
          <p className="text-base text-text-secondary">
            Thought Map을 생성하고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  if (result) {
    return null;
  }

  if (!hasSeenTrustMoment) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col px-[var(--container-x)] py-8">
        <TrustMoment onProceed={() => setHasSeenTrustMoment(true)} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col px-[var(--container-x)] py-8">
      <div className="mb-8 space-y-2">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-text-secondary">
          입장 탐색
        </span>
        <h1 className="text-2xl font-bold font-heading text-text-primary tracking-[-0.02em]">
          나의 생각 발견하기
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          몇 가지 질문에 답하고, 나만의 Thought Map을 확인하세요
        </p>
      </div>

      <OnboardingFlow
        questions={questionsData.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type as "OX" | "RUBRIC" | "OPEN_ENDED",
          phase: q.phase as "core" | "extended",
          allowUncertain: q.type === "RUBRIC",
          tooltipText:
            q.id === 4 || q.id === 9
              ? "왜 묻는지: 매칭 시 대화 난이도를 조절하는 데 사용됩니다."
              : undefined,
        }))}
        onCoreComplete={handleCoreComplete}
        onExtendedComplete={handleExtendedComplete}
        onSkipExtended={handleSkipExtended}
      />
    </main>
  );
}
