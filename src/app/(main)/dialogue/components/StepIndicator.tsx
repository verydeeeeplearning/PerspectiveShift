"use client";

import { motion } from "framer-motion";
import { springSnappy } from "@/app/_shared/motion";

const STEPS = [
  { key: "POSITION", label: "입장", num: "1" },
  { key: "QUESTION", label: "질문", num: "2" },
  { key: "ANSWER", label: "답변", num: "3" },
  { key: "REFLECTION", label: "성찰", num: "4" },
];

interface StepIndicatorProps {
  currentStep: string;
  compact?: boolean;
}

export function StepIndicator({
  currentStep,
  compact = false,
}: StepIndicatorProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div
      className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}
      role="progressbar"
      aria-valuenow={currentIdx + 1}
      aria-valuemin={1}
      aria-valuemax={4}
      aria-label="대화 단계"
    >
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={step.key} className="flex items-center gap-1">
            <motion.div
              className={`
                flex items-center justify-center rounded-full font-medium
                ${compact ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm"}
                ${isDone ? "bg-indigo-depth text-text-inverse" : ""}
                ${isCurrent ? "bg-accent-primary-soft text-indigo-depth ring-2 ring-indigo-depth" : ""}
                ${!isDone && !isCurrent ? "bg-border-divider text-text-tertiary" : ""}
              `}
              animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
              transition={isCurrent ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
            >
              {isDone ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                step.num
              )}
            </motion.div>
            {!compact && (
              <span
                className={`text-sm ${
                  isCurrent ? "font-semibold text-indigo-depth" : isDone ? "text-text-primary" : "text-text-tertiary"
                }`}
              >
                {step.label}
              </span>
            )}
            {idx < STEPS.length - 1 && (
              <motion.div
                className={`${compact ? "w-4" : "w-8"} h-0.5 rounded-full ${
                  idx < currentIdx ? "bg-indigo-depth" : "bg-border-divider"
                }`}
                initial={false}
                animate={{
                  backgroundColor: idx < currentIdx ? "var(--color-indigo-depth)" : "var(--color-border-divider)",
                }}
                transition={springSnappy}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
