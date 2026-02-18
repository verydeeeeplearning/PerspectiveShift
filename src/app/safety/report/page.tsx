"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/_shared/hooks/useAuth";
import { apiAuthPost } from "@/app/_shared/api-client";

const REASONS = [
  { value: "HARASSMENT", label: "괴롭힘" },
  { value: "THREAT", label: "위협" },
  { value: "PII_REQUEST", label: "개인정보 요구" },
  { value: "IMPERSONATION", label: "사칭" },
  { value: "OTHER", label: "기타" },
];

export default function SafetyReportPage() {
  return (
    <Suspense fallback={<div className="p-6">로딩 중...</div>}>
      <SafetyReportContent />
    </Suspense>
  );
}

function SafetyReportContent() {
  const searchParams = useSearchParams();
  const reportedId = searchParams.get("userId");
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reason, setReason] = useState("HARASSMENT");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) return <div className="p-6">로딩 중...</div>;
  if (!reportedId) return <div className="p-6">신고 대상이 지정되지 않았습니다.</div>;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiAuthPost("/api/safety/report", {
        reportedId,
        reason,
        description: description || undefined,
      });
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "신고 실패");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen p-6 max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">신고 완료</h1>
        <p className="text-gray-600 mb-6">신고가 접수되었습니다. 검토 후 조치하겠습니다.</p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          돌아가기
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">사용자 신고</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">신고 사유</label>
          <div className="space-y-2">
            {REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={(e) => setReason(e.target.value)}
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">상세 설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="구체적인 상황을 설명해 주세요..."
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? "제출 중..." : "신고하기"}
        </button>
      </div>
    </main>
  );
}
