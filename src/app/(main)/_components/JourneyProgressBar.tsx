"use client";

import { JOURNEY_PHASES, type JourneyPhaseKey } from "@/domain/value-objects/journey-progress";

interface JourneyProgressBarProps {
  completedPhases: JourneyPhaseKey[];
}

export default function JourneyProgressBar({ completedPhases }: JourneyProgressBarProps) {
  return (
    <div className="flex gap-2">
      {JOURNEY_PHASES.map((phase) => {
        const done = completedPhases.includes(phase.key);
        return (
          <div key={phase.key} className="flex items-center gap-1 text-sm">
            <span>{done ? "✓" : "→"}</span>
            <span className={done ? "text-green-600" : "text-gray-400"}>{phase.label}</span>
          </div>
        );
      })}
    </div>
  );
}
