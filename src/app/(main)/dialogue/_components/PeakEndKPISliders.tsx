"use client";

import { useState } from "react";

interface PeakEndKPISlidersProps {
  onSubmit: (feelHeard: number, rematchIntent: number) => void;
}

export default function PeakEndKPISliders({ onSubmit }: PeakEndKPISlidersProps) {
  const [feelHeard, setFeelHeard] = useState(50);
  const [rematch, setRematch] = useState(50);

  return (
    <div className="space-y-6 rounded-xl border p-5">
      <div>
        <label className="mb-2 block text-sm font-medium">
          상대가 내 말을 이해했나요?
        </label>
        <div className="flex items-center gap-2">
          <span>😕</span>
          <input
            type="range"
            min={0}
            max={100}
            value={feelHeard}
            onChange={(e) => setFeelHeard(Number(e.target.value))}
            className="flex-1"
            aria-label="Feel Heard 슬라이더"
          />
          <span>😊</span>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          이 사람과 더 이야기하고 싶나요?
        </label>
        <div className="flex items-center gap-2">
          <span>🙅</span>
          <input
            type="range"
            min={0}
            max={100}
            value={rematch}
            onChange={(e) => setRematch(Number(e.target.value))}
            className="flex-1"
            aria-label="Rematch Intent 슬라이더"
          />
          <span>🙋</span>
        </div>
      </div>

      <button
        onClick={() => onSubmit(feelHeard, rematch)}
        className="w-full rounded bg-indigo-500 py-2 text-white"
      >
        제출
      </button>
    </div>
  );
}
