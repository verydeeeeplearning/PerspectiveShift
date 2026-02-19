"use client";

import Link from "next/link";

export interface RealtimeChatButtonProps {
  friendshipId: string;
  eligible: boolean;
  reason?: string;
}

export function RealtimeChatButton({
  friendshipId,
  eligible,
  reason,
}: RealtimeChatButtonProps) {
  if (eligible) {
    return (
      <Link
        href={`/chat/${friendshipId}`}
        className="block p-4 border rounded-lg hover:bg-gray-50 text-center font-medium"
      >
        실시간 채팅하기
      </Link>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50 text-center" role="status">
      <p className="font-medium text-gray-500">실시간 채팅 잠금</p>
      {reason && (
        <p className="text-sm text-gray-400 mt-1">{reason}</p>
      )}
    </div>
  );
}
