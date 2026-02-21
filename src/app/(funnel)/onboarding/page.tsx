"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFlow, type AnswerMap } from "./components/OnboardingFlow";
import { DynamicOnboardingFlow, type GeneratedQuestionMeta } from "./components/DynamicOnboardingFlow";
import { TrustMoment } from "./components/TrustMoment";
import { EmailStep } from "./components/EmailStep";
import { DemographicStep, type DemographicInfo } from "./components/DemographicStep";
import { calculateStance, calculateDynamicStance } from "./actions";
import type { ThoughtMapOutput } from "@/application/dtos/thought-map-output";
import questionsData from "@/infrastructure/external/data/questions.json";

const DYNAMIC_QUESTIONS_ENABLED =
  process.env.NEXT_PUBLIC_DYNAMIC_QUESTIONS === "true";

const SEED_QUESTION_COUNT = 10;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"trust" | "email" | "demographic" | "questions">("trust");
  const [demographic, setDemographic] = useState<DemographicInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ThoughtMapOutput | null>(null);
  const lastAnswersRef = useRef<AnswerMap | null>(null);

  const sessionId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("onboarding_session") ||
        (() => {
          const id = crypto.randomUUID();
          sessionStorage.setItem("onboarding_session", id);
          return id;
        })()
      : "server-render";

  const handleTrustProceed = useCallback(() => {
    setStep("email");
  }, []);

  const handleEmailComplete = useCallback(() => {
    setStep("demographic");
  }, []);

  const handleDemographicComplete = useCallback((info: DemographicInfo) => {
    setDemographic(info);
    setStep("questions");
  }, []);

  const runCalculateStance = useCallback(
    async (answers: AnswerMap) => {
      setLoading(true);
      setError(null);
      lastAnswersRef.current = answers;
      try {
        const output = await calculateStance(
          sessionId,
          answers,
          demographic ?? undefined,
        );
        setResult(output);
      } catch (err) {
        console.error("Failed to calculate stance:", err);
        setError("생각 분석에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    },
    [sessionId, demographic],
  );

  const handleCoreComplete = useCallback(
    (answers: AnswerMap) => {
      runCalculateStance(answers);
    },
    [runCalculateStance],
  );

  const handleExtendedComplete = useCallback(
    (answers: AnswerMap) => {
      runCalculateStance(answers);
    },
    [runCalculateStance],
  );

  const handleSkipExtended = useCallback(() => {
    if (result) {
      router.push(
        `/onboarding/result?data=${encodeURIComponent(JSON.stringify(result))}`,
      );
    } else if (lastAnswersRef.current) {
      runCalculateStance(lastAnswersRef.current);
    }
  }, [result, router, runCalculateStance]);

  const handleRetry = useCallback(() => {
    if (lastAnswersRef.current) {
      runCalculateStance(lastAnswersRef.current);
    }
  }, [runCalculateStance]);

  const handleDynamicComplete = useCallback(
    async (answers: AnswerMap, generatedMeta: GeneratedQuestionMeta[]) => {
      setLoading(true);
      setError(null);
      lastAnswersRef.current = answers;
      try {
        const meta = generatedMeta.map((q, i) => ({
          id: q.id,
          numericId: 1000 + i,
          type: q.type,
          dimension: q.dimension,
          polarity: q.polarity,
        }));
        const output = await calculateDynamicStance(
          sessionId,
          answers,
          meta,
          demographic ?? undefined,
        );
        setResult(output);
      } catch (err) {
        console.error("Failed to calculate dynamic stance:", err);
        setError("생각 분석에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    },
    [sessionId, demographic],
  );

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-sm px-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-semantic-difference, #e53e3e)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-base text-text-primary font-medium">
            {error}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mx-auto rounded-lg bg-indigo-depth px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return null;
  }

  if (step === "trust") {
    return (
      <main className="mx-auto flex max-w-2xl flex-col px-[var(--container-x)] py-8">
        <TrustMoment onProceed={handleTrustProceed} />
      </main>
    );
  }

  if (step === "email") {
    return (
      <main className="mx-auto flex max-w-2xl flex-col px-[var(--container-x)] py-8">
        <EmailStep onComplete={handleEmailComplete} />
      </main>
    );
  }

  if (step === "demographic") {
    return (
      <main className="mx-auto flex max-w-2xl flex-col px-[var(--container-x)] py-8">
        <DemographicStep onComplete={handleDemographicComplete} />
      </main>
    );
  }

  const questionFlowContent = DYNAMIC_QUESTIONS_ENABLED ? (
    <DynamicOnboardingFlow
      seedQuestions={questionsData.slice(0, SEED_QUESTION_COUNT).map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type as "OX" | "RUBRIC" | "OPEN_ENDED",
        phase: "core" as const,
        dimension: q.dimension,
        polarity: q.polarity as 1 | -1,
        allowUncertain: q.type === "RUBRIC",
      }))}
      seedMeta={questionsData.slice(0, SEED_QUESTION_COUNT).map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type as "OX" | "RUBRIC" | "OPEN_ENDED",
        dimension: q.dimension,
        polarity: q.polarity as 1 | -1,
      }))}
      onComplete={handleDynamicComplete}
    />
  ) : (
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
  );

  return (
    <main className="mx-auto flex max-w-2xl flex-col px-[var(--container-x)] py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold font-heading text-text-primary tracking-[-0.02em]">
          나의 생각 발견하기
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          몇 가지 질문에 답하고, 나만의 Thought Map을 확인하세요
        </p>
      </div>

      {questionFlowContent}
    </main>
  );
}
