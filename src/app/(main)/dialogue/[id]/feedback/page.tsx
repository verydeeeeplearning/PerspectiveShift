"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAnonymousSession } from "@/app/_shared/hooks/useAnonymousSession";
import { apiPost } from "@/app/_shared/api-client";
import { SatisfactionRating } from "../../components/SatisfactionRating";

export default function FeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isReady } = useAnonymousSession();
  const [satisfaction, setSatisfaction] = useState(0);
  const [rematch, setRematch] = useState(false);
  const [emotion, setEmotion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (satisfaction === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiPost(`/api/dialogue/sessions/${id}/feedback`, {
        satisfaction,
        rematchWillingness: rematch,
        emotionCheckIn: emotion || null,
      });
      router.push(`/dialogue/${id}/summary`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "제출 실패");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isReady) return <div className="p-6">로딩 중...</div>;

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">대화 피드백</h1>
      <p className="text-gray-600 mb-6">
        이 대화 경험에 대한 피드백을 남겨주세요.
      </p>

      {error && (
        <p className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-2">
            대화 만족도
          </label>
          <SatisfactionRating
            value={satisfaction}
            onChange={setSatisfaction}
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rematch}
              onChange={(e) => setRematch(e.target.checked)}
              className="w-4 h-4"
            />
            <span>다른 상대와 다시 대화하고 싶습니다</span>
          </label>
        </div>

        <div>
          <label className="block font-medium mb-2">
            지금 기분은 어떤가요? (선택)
          </label>
          <input
            type="text"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            placeholder="예: 흥미로웠다, 새로운 관점을 얻었다..."
            maxLength={500}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={satisfaction === 0 || submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          {submitting ? "제출 중..." : "피드백 제출"}
        </button>
      </form>
    </main>
  );
}
