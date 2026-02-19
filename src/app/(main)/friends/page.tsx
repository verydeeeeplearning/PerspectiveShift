"use client";

import { useEffect, useState } from "react";
import { apiAuthGet } from "@/app/_shared/api-client";
import Link from "next/link";

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

  if (loading) return <div className="p-6">로딩 중...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">친구 목록</h1>
        <Link href="/matching" className="text-blue-600 hover:underline text-sm">
          새 대화 시작
        </Link>
      </div>

      {friends.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          아직 친구가 없습니다. 대화를 완료한 후 친구 요청을 보내보세요.
        </p>
      ) : (
        <ul className="space-y-3">
          {friends.map((f) => (
            <li key={f.friendshipId}>
              <Link
                href={`/friends/${f.friendshipId}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">참여자_{f.friendUserId.slice(0, 4).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">대화 {f.dialogueCount}회</p>
                  </div>
                  <span className="text-gray-400">&rarr;</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
