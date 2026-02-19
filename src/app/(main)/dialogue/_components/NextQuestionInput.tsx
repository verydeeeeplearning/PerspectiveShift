"use client";

import { useState } from "react";

interface NextQuestionInputProps {
  onSave: (text: string) => void;
}

export default function NextQuestionInput({ onSave }: NextQuestionInputProps) {
  const [text, setText] = useState("");
  const MAX = 200;

  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center gap-2">
        <span className="text-xl" role="img" aria-label="질문">
          💭
        </span>
        <h3 className="font-semibold">다음에 묻고 싶은 질문</h3>
      </div>
      <p className="mt-1 text-xs text-gray-400">
        저장하면 재매칭 시 이 질문으로 시작해요
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX))}
        placeholder="다음에 물어보고 싶은 것을 적어보세요"
        className="mt-3 w-full resize-none rounded border p-2 text-sm"
        rows={2}
        aria-label="다음 질문"
      />
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {text.length}/{MAX}
        </span>
        <button
          onClick={() => text.trim() && onSave(text.trim())}
          disabled={!text.trim()}
          className="rounded bg-indigo-500 px-3 py-1 text-sm text-white disabled:opacity-40"
        >
          저장
        </button>
      </div>
    </div>
  );
}
