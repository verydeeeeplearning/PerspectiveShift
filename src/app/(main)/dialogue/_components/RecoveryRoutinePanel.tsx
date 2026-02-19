"use client";

import { useState } from "react";
import type { RecoveryPromiseType } from "@/domain/value-objects/recovery-promise";

interface RecoveryRoutinePanelProps {
  messages: readonly string[];
  onLater: () => void;
  onFindNew: (selectedPromiseTypes: RecoveryPromiseType[]) => void;
  recoveryBadge?: string;
  isRecoveryMode?: boolean;
}

const PROMISE_OPTIONS: Array<{ type: RecoveryPromiseType; label: string }> = [
  { type: "topic_change", label: "주제 바꾸기" },
  { type: "difficulty_down", label: "난이도 낮추기" },
  { type: "time_reduce", label: "시간 줄이기" },
];

export default function RecoveryRoutinePanel({
  messages,
  onLater,
  onFindNew,
  recoveryBadge,
  isRecoveryMode = true,
}: RecoveryRoutinePanelProps) {
  const [confirming, setConfirming] = useState(false);
  const [selectedPromises, setSelectedPromises] = useState<Set<RecoveryPromiseType>>(
    () => new Set(PROMISE_OPTIONS.map((option) => option.type)),
  );

  const togglePromise = (type: RecoveryPromiseType) => {
    setSelectedPromises((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const selected = Array.from(selectedPromises);
    onFindNew(selected.length > 0 ? selected : PROMISE_OPTIONS.map((option) => option.type));
  };

  return (
    <div className="space-y-4 rounded-xl bg-gray-50 p-6">
      {isRecoveryMode && (
        <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
          {recoveryBadge ?? "복구 모드"}
        </div>
      )}

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
          <div className="space-y-2 rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-700">약속 3개 선택</p>
            {PROMISE_OPTIONS.map((option) => (
              <label key={option.type} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedPromises.has(option.type)}
                  onChange={() => togglePromise(option.type)}
                  className="h-4 w-4"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded border px-4 py-2 text-sm text-gray-600"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
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
