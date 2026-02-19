"use client";

import { useState } from "react";

export interface SwitchSidesFormProps {
  sessionId: string;
  onSubmit: (data: { switchedPerspective: string }) => void;
  disabled?: boolean;
}

export function SwitchSidesForm({
  sessionId,
  onSubmit,
  disabled = false,
}: SwitchSidesFormProps) {
  const [switchedPerspective, setSwitchedPerspective] = useState("");

  const canSubmit = switchedPerspective.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ switchedPerspective: switchedPerspective.trim() });
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Switch Sides Mini">
      <h3 className="text-lg font-semibold mb-4">Switch Sides Mini</h3>
      <p className="text-sm text-gray-600 mb-4">
        상대 입장에서 내 주장을 1문장으로 말해보기 (5분)
      </p>

      <div>
        <label htmlFor={`switched-${sessionId}`} className="block text-sm font-medium mb-1">
          상대의 관점에서 본 나의 주장
        </label>
        <textarea
          id={`switched-${sessionId}`}
          value={switchedPerspective}
          onChange={(e) => setSwitchedPerspective(e.target.value)}
          className="w-full border rounded-lg p-2 text-sm"
          rows={3}
          placeholder="상대방의 입장에서 보면, 내 주장은..."
          disabled={disabled}
        />
      </div>

      <button
        type="submit"
        disabled={disabled || !canSubmit}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        제출하기
      </button>
    </form>
  );
}
