"use client";

import { useState } from "react";

interface GiftMessageInputProps {
  onSubmit: (text: string) => void;
}

export default function GiftMessageInput({ onSubmit }: GiftMessageInputProps) {
  const [text, setText] = useState("");
  const MAX = 100;

  return (
    <div className="rounded-lg border border-dashed p-4">
      <p className="mb-2 text-sm text-gray-500">
        대화 마지막에 상대에게 한 문장을 남길 수 있어요. 지금 써두면 나중에
        전달돼요. (선택)
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX))}
        placeholder="따뜻한 한 마디를 남겨보세요"
        className="w-full resize-none rounded border p-2 text-sm"
        rows={2}
        aria-label="선물 메시지"
      />
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {text.length}/{MAX}
        </span>
        <button
          onClick={() => text.trim() && onSubmit(text.trim())}
          disabled={!text.trim()}
          className="rounded bg-indigo-500 px-3 py-1 text-sm text-white disabled:opacity-40"
        >
          저장
        </button>
      </div>
    </div>
  );
}
