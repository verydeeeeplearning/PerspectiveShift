"use client";

import { useState } from "react";
import { useAuth } from "@/app/_shared/hooks/useAuth";
import { apiAuthPost } from "@/app/_shared/api-client";

interface FriendRequestCTAProps {
  targetUserId: string;
  dialogueSessionId: string;
}

export function FriendRequestCTA({ targetUserId, dialogueSessionId }: FriendRequestCTAProps) {
  const { isAuthenticated } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (!isAuthenticated) return null;

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      await apiAuthPost("/api/relationship/friend-request", {
        targetId: targetUserId,
        dialogueSessionId,
      });
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "친구 요청 실패");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
        <p className="text-green-700">친구 요청을 보냈습니다!</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
      <p className="text-gray-700 mb-3">이 대화 상대와 친구가 되고 싶으신가요?</p>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <button
        onClick={handleSend}
        disabled={sending}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {sending ? "요청 중..." : "친구 요청 보내기"}
      </button>
    </div>
  );
}
