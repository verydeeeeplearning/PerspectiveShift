"use client";

import { motion } from "framer-motion";
import { springGentle } from "@/app/_shared/motion";

interface MatchScoreBarProps {
  score: number;
}

export function MatchScoreBar({ score }: MatchScoreBarProps) {
  const percentage = Math.round(score * 100);

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-text-secondary text-xs">매칭 점수</span>
        <span className="text-text-primary font-medium text-xs num">{percentage}%</span>
      </div>
      <div
        className="w-full bg-border-divider rounded-full h-1.5 overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="매칭 점수"
      >
        <motion.div
          className="bg-indigo-depth h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={springGentle}
        />
      </div>
    </div>
  );
}
