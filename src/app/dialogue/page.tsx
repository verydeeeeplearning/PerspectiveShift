"use client";

import { useEffect, useState } from "react";
import { useAnonymousSession } from "@/app/_shared/hooks/useAnonymousSession";
import { apiGet } from "@/app/_shared/api-client";
import type { DialogueSessionOutput } from "@/application/dtos/dialogue-output";
import Link from "next/link";
import { StepIndicator } from "./components/StepIndicator";

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

  if (!isReady) return <div className="p-6">세션 초기화 중...</div>;

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">내 대화 목록</h1>

      {loading && <p className="text-gray-500">로딩 중...</p>}

      {!loading && sessions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">진행 중인 대화가 없습니다</p>
          <Link
            href="/matching"
            className="text-blue-600 hover:underline"
          >
            대화 상대 찾기 &rarr;
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/dialogue/${session.id}`}
            className="block border rounded-lg p-4 hover:border-blue-400 transition-colors"
          >
            <div className="flex justify-between items-center mb-2">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  session.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : session.status === "COMPLETED"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {session.status === "ACTIVE"
                  ? "진행 중"
                  : session.status === "COMPLETED"
                    ? "완료"
                    : session.status === "EXPIRED"
                      ? "만료"
                      : "취소"}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(session.updatedAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
            <StepIndicator currentStep={session.currentStep} compact />
          </Link>
        ))}
      </div>
    </main>
  );
}
