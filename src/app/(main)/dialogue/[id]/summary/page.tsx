"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAnonymousSession } from "@/app/_shared/hooks/useAnonymousSession";
import { apiGet } from "@/app/_shared/api-client";
import type { SummaryCardOutput } from "@/application/dtos/feedback-output";
import { SummaryCardView } from "../../components/SummaryCard";
import Link from "next/link";

export default function SummaryPage() {
  const { id } = useParams<{ id: string }>();
  const { isReady } = useAnonymousSession();
  const [summary, setSummary] = useState<SummaryCardOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !id) return;
    apiGet<SummaryCardOutput>(`/api/dialogue/sessions/${id}/summary`)
      .then(setSummary)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isReady, id]);

  if (!isReady || loading) return <div className="p-6">로딩 중...</div>;

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!summary) return <div className="p-6">요약을 찾을 수 없습니다.</div>;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">대화 요약 카드</h1>
      <SummaryCardView summary={summary} />
      <div className="mt-6 text-center">
        <Link
          href="/matching"
          className="text-blue-600 hover:underline"
        >
          새로운 대화 시작하기 &rarr;
        </Link>
      </div>
    </main>
  );
}
