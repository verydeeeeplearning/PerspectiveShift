"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiAuthPost } from "@/app/_shared/api-client";

export default function OfflinePage() {
  return (
    <Suspense fallback={<div className="p-6">로딩 중...</div>}>
      <OfflineContent />
    </Suspense>
  );
}

function OfflineContent() {
  const searchParams = useSearchParams();
  const friendshipId = searchParams.get("friendshipId");
  const router = useRouter();
  const [proposedAt, setProposedAt] = useState("");
  const [locationHint, setLocationHint] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!friendshipId) return <div className="p-6">friendshipId가 필요합니다.</div>;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiAuthPost("/api/offline/proposals", {
        friendshipId,
        proposedAt: proposedAt || undefined,
        locationHint: locationHint || undefined,
      });
      router.push(`/friends/${friendshipId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "제안 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">오프라인 만남 제안</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">제안 일시 (선택)</label>
          <input
            type="datetime-local"
            value={proposedAt}
            onChange={(e) => setProposedAt(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">장소 힌트 (선택)</label>
          <input
            type="text"
            value={locationHint}
            onChange={(e) => setLocationHint(e.target.value)}
            placeholder="예: 강남역 근처"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "제안 중..." : "만남 제안하기"}
        </button>
      </div>
    </main>
  );
}
