"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFlow, type AnswerMap } from "./components/OnboardingFlow";
import { calculateStance } from "./actions";
import type { ThoughtMapOutput } from "@/application/dtos/thought-map-output";
import questionsData from "@/infrastructure/external/data/questions.json";

export default function OnboardingPage() {
  const router = useRouter();
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
      <div className="flexitems-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-lg text-gray-600">
            Thought Map을 생성하고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  if (result) {
    return null;
  }

  return (
    <main className="mx-auto flexmax-w-2xl flex-col px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">나의 생각 발견하기</h1>
        <p className="mt-2 text-gray-600">
          몇 가지 질문에 답하고, 나만의 Thought Map을 확인하세요
        </p>
      </div>

      <OnboardingFlow
        questions={questionsData.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type as "OX" | "RUBRIC" | "OPEN_ENDED",
          phase: q.phase as "core" | "extended",
        }))}
        onCoreComplete={handleCoreComplete}
        onExtendedComplete={handleExtendedComplete}
        onSkipExtended={handleSkipExtended}
      />
    </main>
  );
}
