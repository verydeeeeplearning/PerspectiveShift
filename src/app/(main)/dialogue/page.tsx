"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAnonymousSession } from "@/app/_shared/hooks/useAnonymousSession";
import { apiGet } from "@/app/_shared/api-client";
import type { DialogueSessionOutput } from "@/application/dtos/dialogue-output";
import Link from "next/link";
import { StepIndicator } from "./components/StepIndicator";
import { PaperCard } from "@/app/_shared/components/PaperCard";
import { CardSkeleton } from "@/app/_shared/components/Skeleton";
import { AnimatedListItem } from "@/app/_shared/components/AnimatedList";

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
    return (
      <main className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="space-y-2">
          <div className="skeleton h-3 w-10" />
          <div className="skeleton h-7 w-36" />
        </div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </main>
    );
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "진행 중", className: "bg-indigo-depth text-text-inverse" },
    COMPLETED: { label: "완료", className: "bg-semantic-similarity-soft text-semantic-similarity" },
    EXPIRED: { label: "만료", className: "bg-transparent border border-dashed border-border-soft text-text-tertiary" },
    CANCELLED: { label: "취소", className: "bg-transparent border border-dashed border-border-soft text-text-tertiary" },
  };

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
          내 대화 목록
        </h1>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Empty state */}
      {!loading && sessions.length === 0 && (
        <motion.div
          className="text-center py-16 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-primary-soft flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-lg text-text-primary font-heading font-semibold">
            아직 대화가 없어요
          </p>
          <Link
            href="/matching"
            className="inline-flex items-center gap-1 text-indigo-depth font-medium text-sm hover:underline"
          >
            대화 상대 찾기
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </motion.div>
      )}

      {/* Session list */}
      <div className="space-y-3">
        {sessions.map((session, idx) => {
          const status = statusConfig[session.status] ?? statusConfig.CANCELLED;
          return (
            <AnimatedListItem key={session.id} index={idx}>
              <Link href={`/dialogue/${session.id}`}>
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
            </AnimatedListItem>
          );
        })}
      </div>
    </main>
  );
}
