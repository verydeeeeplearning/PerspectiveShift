"use client";

import type { DialogueTurnOutput } from "@/application/dtos/dialogue-output";

interface TurnDisplayProps {
  turn: DialogueTurnOutput;
}

export function TurnDisplay({ turn }: TurnDisplayProps) {
  return (
    <div
      className={`p-4 rounded-lg ${
        turn.isMine
          ? "bg-blue-50 border-l-4 border-blue-400"
          : "bg-gray-50 border-l-4 border-gray-300"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">
          {turn.isMine ? "나" : "상대"}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(turn.createdAt).toLocaleString("ko-KR")}
        </span>
      </div>
      <p className="text-gray-800 whitespace-pre-wrap">{turn.content}</p>
    </div>
  );
}
