"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAnonymousSession } from "@/app/_shared/hooks/useAnonymousSession";
import { apiGet, apiPost } from "@/app/_shared/api-client";
import type { DialogueSessionOutput } from "@/application/dtos/dialogue-output";
import type { TurnSubmissionResult } from "@/application/dtos/dialogue-output";
import { StepIndicator } from "../components/StepIndicator";
import { TurnSubmissionForm } from "../components/TurnSubmissionForm";
import { TurnDisplay } from "../components/TurnDisplay";
import { WaitingForOpponent } from "../components/WaitingForOpponent";
import { FacilitatorWarning } from "../components/FacilitatorWarning";
import Link from "next/link";

export default function DialogueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isReady } = useAnonymousSession();
  const [session, setSession] = useState<DialogueSessionOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<{
    type: "tone" | "drift";
    suggestion: string;
  } | null>(null);

  const loadSession = useCallback(() => {
    if (!isReady || !id) return;
    apiGet<DialogueSessionOutput>(`/api/dialogue/sessions/${id}`)
      .then(setSession)
      .finally(() => setLoading(false));
  }, [isReady, id]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleSubmit = async (content: string) => {
    const result = await apiPost<TurnSubmissionResult>(
      `/api/dialogue/sessions/${id}/turns`,
      { content },
    );

    if (!result.toneCheck.passed && result.toneCheck.suggestion) {
      setWarning({ type: "tone", suggestion: result.toneCheck.suggestion });
    } else if (result.driftCheck.drifted && result.driftCheck.suggestion) {
      setWarning({ type: "drift", suggestion: result.driftCheck.suggestion });
    } else {
      setWarning(null);
    }

    loadSession();
  };

  if (!isReady || loading) {
    return <div className="p-6">로딩 중...</div>;
  }

  if (!session) {
    return <div className="p-6">세션을 찾을 수 없습니다.</div>;
  }

  const showForm =
    session.status === "ACTIVE" && !session.mySubmitted;
  const showWaiting =
    session.status === "ACTIVE" && session.mySubmitted;

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <StepIndicator currentStep={session.currentStep} />
      </div>

      {session.status === "COMPLETED" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
          <p className="font-medium text-blue-800 mb-2">
            대화가 완료되었습니다
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href={`/dialogue/${id}/feedback`}
              className="text-blue-600 hover:underline text-sm"
            >
              피드백 남기기
            </Link>
            <Link
              href={`/dialogue/${id}/summary`}
              className="text-blue-600 hover:underline text-sm"
            >
              요약 카드 보기
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {session.turns.map((turn) => (
          <TurnDisplay key={turn.id} turn={turn} />
        ))}
      </div>

      {warning && (
        <FacilitatorWarning
          type={warning.type}
          suggestion={warning.suggestion}
        />
      )}

      {showForm && (
        <TurnSubmissionForm
          currentStep={session.currentStep}
          onSubmit={handleSubmit}
        />
      )}

      {showWaiting && (
        <WaitingForOpponent currentStep={session.currentStep} />
      )}
    </main>
  );
}
