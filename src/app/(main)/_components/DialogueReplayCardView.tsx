"use client";

import { THOUGHT_CHANGE_OPTIONS, type ThoughtChangeOption } from "@/domain/value-objects/dialogue-replay-card";

interface DialogueReplayCardViewProps {
  opponentKeyStatement: string;
  topic: string;
  onRespond: (choice: ThoughtChangeOption) => void;
}

export default function DialogueReplayCardView({
  opponentKeyStatement,
  topic,
  onRespond,
}: DialogueReplayCardViewProps) {
  return (
    <div className="rounded-xl border p-5">
      <p className="text-xs text-gray-400">주제: {topic}</p>
      <blockquote className="mt-2 border-l-4 border-indigo-300 pl-3 text-sm italic">
        {opponentKeyStatement}
      </blockquote>
      <p className="mt-4 text-sm font-medium">이 발언을 다시 생각해보니...</p>
      <div className="mt-2 space-y-2">
        {THOUGHT_CHANGE_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => onRespond(opt)}
            className="w-full rounded border px-3 py-2 text-left text-sm hover:bg-gray-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
