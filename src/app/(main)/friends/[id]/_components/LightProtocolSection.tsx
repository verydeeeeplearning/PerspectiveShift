"use client";

import { useState } from "react";

export type ProtocolType = "COMMON_GROUND" | "JOINT_QUESTION" | "SWITCH_SIDES";

const PROTOCOL_LABELS: Record<ProtocolType, { name: string; time: string }> = {
  COMMON_GROUND: { name: "Common Ground Check", time: "3분" },
  JOINT_QUESTION: { name: "Joint Question", time: "5분" },
  SWITCH_SIDES: { name: "Switch Sides Mini", time: "5분" },
};

export interface LightProtocolSectionProps {
  onStart: (type: ProtocolType) => Promise<void>;
  disabled?: boolean;
}

export function LightProtocolSection({
  onStart,
  disabled = false,
}: LightProtocolSectionProps) {
  const [starting, setStarting] = useState(false);

  async function handleStart(type: ProtocolType) {
    setStarting(true);
    try {
      await onStart(type);
    } finally {
      setStarting(false);
    }
  }

  return (
    <section className="mb-6 p-4 border rounded-lg" aria-label="라이트 프로토콜">
      <h2 className="font-semibold mb-2">라이트 프로토콜</h2>
      <p className="text-sm text-gray-600 mb-3">
        짧은 구조화 대화로 서로를 더 잘 이해해보세요
      </p>
      <div className="space-y-2">
        {(Object.keys(PROTOCOL_LABELS) as ProtocolType[]).map((type) => (
          <button
            key={type}
            disabled={disabled || starting}
            onClick={() => handleStart(type)}
            className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 text-sm disabled:opacity-50"
            aria-label={`${PROTOCOL_LABELS[type].name} 시작`}
          >
            <span className="font-medium">{PROTOCOL_LABELS[type].name}</span>
            <span className="text-gray-500 ml-2">({PROTOCOL_LABELS[type].time})</span>
          </button>
        ))}
      </div>
    </section>
  );
}
