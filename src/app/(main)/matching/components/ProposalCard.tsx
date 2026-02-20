"use client";

import { motion } from "framer-motion";
import type { MatchCandidateOutput } from "@/application/dtos/match-output";
import { MatchScoreBar } from "./MatchScoreBar";
import { springSnappy } from "@/app/_shared/motion";

interface ProposalCardProps {
  candidate: MatchCandidateOutput;
  onPropose: () => void;
}

export function ProposalCard({ candidate, onPropose }: ProposalCardProps) {
  return (
    <motion.div
      className="rounded-card border border-border-soft bg-surface-card p-4 shadow-paper"
      role="listitem"
      whileHover={{
        y: -2,
        boxShadow: "0 4px 16px rgba(44, 62, 80, 0.08)",
        borderColor: "rgba(99, 102, 241, 0.3)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={springSnappy}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs text-text-secondary">생각의 차이</span>
          <p className="font-medium text-text-primary num">
            {(candidate.distance * 100).toFixed(0)}%
          </p>
        </div>
        <span className="bg-semantic-similarity-soft text-semantic-similarity text-[11px] font-medium px-2.5 py-0.5 rounded-pill">
          적정 거리
        </span>
      </div>

      <MatchScoreBar score={candidate.score} />

      <div className="mt-3 flex justify-between items-center">
        <span className="text-sm text-text-secondary num">
          대화 준비도: {(candidate.readiness * 100).toFixed(0)}%
        </span>
        <motion.button
          onClick={onPropose}
          className="gradient-cta text-text-inverse px-4 py-2 rounded-pill text-sm font-semibold shadow-cta"
          aria-label="대화 제안하기"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          transition={springSnappy}
        >
          대화 제안
        </motion.button>
      </div>
    </motion.div>
  );
}
