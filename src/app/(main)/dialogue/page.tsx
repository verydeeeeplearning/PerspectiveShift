"use client";

import { useEffect, useState } from "react";
import { useAnonymousSession } from "@/app/_shared/hooks/useAnonymousSession";
import { apiGet } from "@/app/_shared/api-client";
import type { DialogueSessionOutput } from "@/application/dtos/dialogue-output";
import Link from "next/link";
import { StepIndicator } from "./components/StepIndicator";
import { PaperCard } from "@/app/_shared/components/PaperCard";

export default function DialogueListPage() {
  const { isReady } = useAnonymousSession();
  const [sessions, setSessions] = useState<DialogueSessionOutput[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    apiGet<{ sessions: DialogueSessionOutput[] }>("/api/dialogue/sessions")
      .then((data) => setSessions(data.sessions))
      .finally(() => setLoading(false));
  }, [isReady]);

  if (!isReady) {
    return <div className="p-6 text-text-secondary">세션 초기화 중...</div>;
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "진행 중", className: "bg-indigo-depth text-text-inverse" },
    COMPLETED: { label: "완료", className: "bg-energy-rest-base text-text-secondary" },
    EXPIRED: { label: "만료", className: "bg-transparent border border-dashed border-border-soft text-text-tertiary" },
    CANCELLED: { label: "취소", className: "bg-transparent border border-dashed border-border-soft text-text-tertiary" },
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="mb-6 space-y-2">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-text-secondary">
          대화
        </span>
        <h1 className="text-2xl font-bold font-heading text-text-primary tracking-[-0.02em]">
          내 대화 목록
        </h1>
      </div>

      {loading && <p className="text-text-tertiary">로딩 중...</p>}

      {!loading && sessions.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <p className="text-lg text-text-primary font-heading">
            아직 대화가 없어요
          </p>
          <Link
            href="/matching"
            className="text-indigo-depth font-medium hover:underline text-sm"
          >
            대화 상대 찾기 →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {sessions.map((session) => {
          const status = statusConfig[session.status] ?? statusConfig.CANCELLED;
          return (
            <Link key={session.id} href={`/dialogue/${session.id}`}>
              <PaperCard variant="interactive">
                <div className="flex justify-between items-center mb-3">
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-pill font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                  <span className="text-[11px] text-text-tertiary num">
                    {new Date(session.updatedAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <StepIndicator currentStep={session.currentStep} compact />
              </PaperCard>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
