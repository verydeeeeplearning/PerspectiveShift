"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PeakEndKPISlidersProps {
  onSubmit: (feelHeard: number, rematchIntent: number, trailerAccuracy: number) => void;
}

export default function PeakEndKPISliders({ onSubmit }: PeakEndKPISlidersProps) {
  const [feelHeard, setFeelHeard] = useState(50);
  const [rematch, setRematch] = useState(50);
  const [trailerAccuracy, setTrailerAccuracy] = useState(50);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleAutoSave = useCallback(() => {
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSubmit(feelHeard, rematch, trailerAccuracy);
      setSaved(true);
    }, 1500);
  }, [feelHeard, rematch, trailerAccuracy, onSubmit]);

  useEffect(() => {
    scheduleAutoSave();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleAutoSave]);

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

      <div>
        <label className="mb-2 block text-sm font-medium">
          미리보기가 실제 대화와 얼마나 비슷했나요?
        </label>
        <div className="flex items-center gap-2">
          <span>😐</span>
          <input
            type="range"
            min={0}
            max={100}
            value={trailerAccuracy}
            onChange={(e) => setTrailerAccuracy(Number(e.target.value))}
            className="flex-1"
            aria-label="Trailer 일치도 슬라이더"
          />
          <span>🎯</span>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400" aria-live="polite">
        {saved ? "저장됨 \u2713" : "\u00A0"}
      </p>
    </div>
  );
}
