"use client";

import { motion } from "framer-motion";
import type { EnergyLevelKey } from "@/domain/value-objects/energy-level";
import { springSnappy } from "@/app/_shared/motion";

interface EnergySelectorProps {
  selected: EnergyLevelKey;
  onSelect: (key: EnergyLevelKey) => void;
}

const OPTIONS: { key: EnergyLevelKey; emoji: string; label: string }[] = [
  { key: "HIGH", emoji: "🔋🔋🔋", label: "높음" },
  { key: "NORMAL", emoji: "🔋🔋", label: "보통" },
  { key: "LOW", emoji: "🔋", label: "낮음" },
];

export function EnergySelector({ selected, onSelect }: EnergySelectorProps) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="에너지 선택">
      {OPTIONS.map((opt) => {
        const isSelected = selected === opt.key;
        return (
          <motion.button
            key={opt.key}
            type="button"
            onClick={() => onSelect(opt.key)}
            role="radio"
            aria-checked={isSelected}
            className={`relative flex flex-1 flex-col items-center gap-1 rounded-input px-3 py-2.5 text-sm transition-colors ${
              isSelected
                ? "border-2 border-indigo-depth bg-accent-primary-soft text-text-primary"
                : "border border-border-soft bg-surface-card text-text-secondary hover:border-indigo-depth/20 hover:bg-accent-primary-soft/50"
            }`}
            whileTap={{ scale: 0.95 }}
            transition={springSnappy}
          >
            {isSelected && (
              <motion.div
                layoutId="energy-indicator"
                className="absolute inset-0 rounded-input border-2 border-indigo-depth"
                transition={springSnappy}
              />
            )}
            <span className="relative text-lg">{opt.emoji}</span>
            <span className="relative text-xs font-medium">{opt.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
