"use client";

import { useEffect, useState } from "react";
import { apiAuthGet } from "@/app/_shared/api-client";
import Link from "next/link";
import { PaperCard } from "@/app/_shared/components/PaperCard";

interface FriendItem {
  friendshipId: string;
  friendUserId: string;
  status: string;
  dialogueCount: number;
  createdAt: string;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiAuthGet<{ friends: FriendItem[] }>("/api/relationship/friends")
      .then((data) => setFriends(data.friends))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-text-secondary">로딩 중...</div>;
  }
  if (error) {
    return (
      <div className="p-6 text-semantic-difference bg-semantic-difference-soft rounded-chip">
        {error}
      </div>
    );
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-text-secondary">
            친구
          </span>
          <h1 className="text-2xl font-bold font-heading text-text-primary tracking-[-0.02em]">
            친구 목록
          </h1>
        </div>
        <Link
          href="/matching"
          className="text-indigo-depth font-medium hover:underline text-sm"
        >
          새 대화 시작
        </Link>
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-lg text-text-primary font-heading">
            아직 친구가 없습니다
          </p>
          <p className="text-sm text-text-tertiary">
            대화를 완료한 후 친구 요청을 보내보세요
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {friends.map((f) => (
            <li key={f.friendshipId}>
              <Link href={`/friends/${f.friendshipId}`}>
                <PaperCard variant="interactive">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <p className="font-medium text-text-primary">
                        참여자_{f.friendUserId.slice(0, 4).toUpperCase()}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        대화 <span className="num">{f.dialogueCount}</span>회
                      </p>
                    </div>
                    <span className="text-text-tertiary">→</span>
                  </div>
                </PaperCard>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
