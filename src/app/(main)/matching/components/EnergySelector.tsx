"use client";

import type { EnergyLevelKey } from "@/domain/value-objects/energy-level";

interface EnergySelectorProps {
  selected: EnergyLevelKey;
  onSelect: (key: EnergyLevelKey) => void;
}

const OPTIONS: { key: EnergyLevelKey; emoji: string; label: string }[] = [
  { key: "HIGH", emoji: "🔋🔋🔋", label: "충만" },
  { key: "NORMAL", emoji: "🔋", label: "보통" },
  { key: "LOW", emoji: "🪫", label: "낮음" },
];

export function EnergySelector({ selected, onSelect }: EnergySelectorProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onSelect(opt.key)}
          className={`flex flex-1 flex-col items-center gap-1 rounded-lg border-2 px-3 py-2.5 text-sm transition-colors ${
            selected === opt.key
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          <span className="text-lg">{opt.emoji}</span>
          <span className="text-xs font-medium">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
