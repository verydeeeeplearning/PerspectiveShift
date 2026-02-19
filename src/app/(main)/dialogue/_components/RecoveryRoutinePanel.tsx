"use client";

import { useState } from "react";

interface RecoveryRoutinePanelProps {
  messages: readonly string[];
  onLater: () => void;
  onFindNew: () => void;
}

export default function RecoveryRoutinePanel({
  messages,
  onLater,
  onFindNew,
}: RecoveryRoutinePanelProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-4 rounded-xl bg-gray-50 p-6">
      {messages.map((msg, i) => (
        <p key={i} className="text-sm text-gray-700">
          {msg}
        </p>
      ))}

      {confirming ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
          <p className="text-sm font-medium text-gray-800">
            복구를 진행하면 현재 기록이 제외될 수 있어요. 계속할까요?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded border px-4 py-2 text-sm text-gray-600"
            >
              취소
            </button>
            <button
              onClick={onFindNew}
              className="flex-1 rounded bg-gray-200 px-4 py-2 text-sm text-gray-700"
            >
              확인
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={onLater}
            className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-600"
          >
            나중에 할게요
          </button>
          <button
            onClick={() => setConfirming(true)}
            className="w-full rounded border px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            바로 찾아봐요
          </button>
        </div>
      )}
    </div>
  );
}
