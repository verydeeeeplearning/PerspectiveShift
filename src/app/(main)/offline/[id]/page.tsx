"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { apiAuthPost } from "@/app/_shared/api-client";

interface MeetingDetail {
  id: string;
  friendshipId: string;
  proposerId: string;
  status: string;
  safetyCheckinStatus: string;
  proposedAt: string | null;
  locationHint: string | null;
  createdAt: string;
}

export default function OfflineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRespond = async (action: "confirm" | "cancel") => {
    try {
      const result = await apiAuthPost<MeetingDetail>(
        `/api/offline/proposals/${id}/respond`,
        { action },
      );
      setMeeting(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "응답 실패");
    }
  };

  const handleCheckin = async (status: string) => {
    try {
      const result = await apiAuthPost<MeetingDetail>(
        `/api/offline/proposals/${id}/checkin`,
        { status },
      );
      setMeeting(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "체크인 실패");
    }
  };

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">오프라인 만남</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {meeting && (
        <div className="p-4 border rounded-lg mb-6">
          <p>상태: <span className="font-medium">{meeting.status}</span></p>
          {meeting.proposedAt && (
            <p>일시: {new Date(meeting.proposedAt).toLocaleString("ko-KR")}</p>
          )}
          {meeting.locationHint && <p>장소: {meeting.locationHint}</p>}
          <p>안전 체크인: {meeting.safetyCheckinStatus}</p>
        </div>
      )}

      <section className="space-y-3 mb-6">
        <h2 className="font-semibold">응답</h2>
        <div className="flex gap-3">
          <button
            onClick={() => handleRespond("confirm")}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            확정
          </button>
          <button
            onClick={() => handleRespond("cancel")}
            className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            취소
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">안전 체크인</h2>
        <div className="flex gap-3">
          <button
            onClick={() => handleCheckin("SAFE")}
            className="flex-1 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
          >
            안전
          </button>
          <button
            onClick={() => handleCheckin("CONCERN")}
            className="flex-1 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
          >
            우려
          </button>
        </div>
      </section>
    </main>
  );
}
