"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiAuthGet, apiAuthPost, apiAuthDelete } from "@/app/_shared/api-client";
import Link from "next/link";
import { LightProtocolSection } from "./_components/LightProtocolSection";
import { RealtimeChatButton } from "./_components/RealtimeChatButton";
import type { ProtocolType } from "./_components/LightProtocolSection";

interface FriendDetail {
  friendshipId: string;
  friendUserId: string;
  status: string;
  dialogueCount: number;
  completedLightProtocols?: number;
}

interface RealtimeEligibility {
  eligible: boolean;
  reason?: string;
}

interface DisclosureInfo {
  myLevel: number;
  theirLevel: number;
}

const DISCLOSURE_LABELS = ["익명 별칭", "성향 타입", "전체 스탠스", "표시 이름"];

type RelationshipStage = "friend" | "realtime" | "offline";

function getRelationshipStage(input: {
  dialogueCount: number;
  disclosureLevel: number;
  realtimeEligible: boolean;
}): RelationshipStage {
  if (input.dialogueCount >= 3 && input.disclosureLevel >= 2) {
    return "offline";
  }
  if (input.realtimeEligible) {
    return "realtime";
  }
  return "friend";
}

export default function FriendDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [friend, setFriend] = useState<FriendDetail | null>(null);
  const [disclosure, setDisclosure] = useState<DisclosureInfo | null>(null);
  const [eligibility, setEligibility] = useState<RealtimeEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiAuthGet<FriendDetail>(`/api/relationship/friends/${id}`),
      apiAuthGet<DisclosureInfo>(`/api/relationship/disclosure?friendshipId=${id}`),
      apiAuthGet<RealtimeEligibility>(`/api/chat/${id}/eligibility`),
    ])
      .then(([f, d, e]) => { setFriend(f); setDisclosure(d); setEligibility(e); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEscalate = async () => {
    if (!disclosure || !id) return;
    try {
      const newLevel = disclosure.myLevel + 1;
      await apiAuthPost("/api/relationship/disclosure", { friendshipId: id, level: newLevel });
      setDisclosure({ ...disclosure, myLevel: newLevel });
    } catch (e) {
      setError(e instanceof Error ? e.message : "공개 레벨 변경 실패");
    }
  };

  const handleUnfriend = async () => {
    if (!id) return;
    try {
      await apiAuthDelete(`/api/relationship/friends/${id}`);
      router.replace("/friends");
    } catch (e) {
      setError(e instanceof Error ? e.message : "친구 해제 실패");
    }
  };

  const handleStartProtocol = async (type: ProtocolType) => {
    try {
      await apiAuthPost("/api/light-protocol", { friendshipId: id, type, initiatorId: "me" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "프로토콜 시작 실패");
    }
  };

  if (loading) return <div className="p-6">로딩 중...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!friend) return <div className="p-6">친구를 찾을 수 없습니다.</div>;

  const stage = getRelationshipStage({
    dialogueCount: friend.dialogueCount,
    disclosureLevel: disclosure?.myLevel ?? 0,
    realtimeEligible: eligibility?.eligible ?? false,
  });

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <Link href="/friends" className="text-blue-600 hover:underline text-sm">&larr; 목록</Link>
      <h1 className="text-2xl font-bold mt-4 mb-6">
        참여자_{friend.friendUserId.slice(0, 4).toUpperCase()}
      </h1>

      <section className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-2 font-semibold">관계 단계</h2>
        <p className="mb-3 text-sm text-gray-600">
          현재 단계:{" "}
          <span className="font-medium">
            {stage === "friend" && "친구"}
            {stage === "realtime" && "실시간 채팅"}
            {stage === "offline" && "오프라인 만남 제안"}
          </span>
        </p>
        <ul className="space-y-2 text-sm">
          <li className={friend.dialogueCount >= 1 ? "text-gray-800" : "text-gray-400"}>
            1. 구조화 대화 완료 후 친구 유지
          </li>
          <li className={eligibility?.eligible ? "text-gray-800" : "text-gray-400"}>
            2. 친구 관계에서 실시간 채팅 열기
          </li>
          <li
            className={
              friend.dialogueCount >= 3 && (disclosure?.myLevel ?? 0) >= 2
                ? "text-gray-800"
                : "text-gray-400"
            }
          >
            3. 3회 이상 대화 + 공개 레벨 2 이상이면 오프라인 만남 제안
          </li>
        </ul>
      </section>

      <section className="mb-6 p-4 border rounded-lg">
        <h2 className="font-semibold mb-2">공개 레벨</h2>
        <p className="text-sm text-gray-600 mb-1">
          내 공개: <span className="font-medium">{DISCLOSURE_LABELS[disclosure?.myLevel ?? 0]}</span> (레벨 {disclosure?.myLevel ?? 0})
        </p>
        <p className="text-sm text-gray-600 mb-3">
          상대 공개: <span className="font-medium">{DISCLOSURE_LABELS[disclosure?.theirLevel ?? 0]}</span> (레벨 {disclosure?.theirLevel ?? 0})
        </p>
        {(disclosure?.myLevel ?? 0) < 3 && (
          <button
            onClick={handleEscalate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            공개 레벨 올리기 &rarr; {DISCLOSURE_LABELS[(disclosure?.myLevel ?? 0) + 1]}
          </button>
        )}
      </section>

      <LightProtocolSection onStart={handleStartProtocol} />

      <section className="mb-6 space-y-3">
        <RealtimeChatButton
          friendshipId={id}
          eligible={eligibility?.eligible ?? false}
          reason={eligibility?.reason}
        />
        {friend.dialogueCount >= 3 && (disclosure?.myLevel ?? 0) >= 2 && (
          <Link
            href={`/offline?friendshipId=${id}`}
            className="block p-4 border rounded-lg hover:bg-gray-50 text-center font-medium"
          >
            오프라인 만남 제안하기
          </Link>
        )}
      </section>

      <div className="flex gap-3">
        <button
          onClick={handleUnfriend}
          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
        >
          친구 해제
        </button>
        <Link
          href={`/safety/report?userId=${friend.friendUserId}`}
          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
        >
          신고하기
        </Link>
      </div>
    </main>
  );
}
