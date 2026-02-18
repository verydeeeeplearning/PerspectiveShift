"use client";

import type { MatchCandidateOutput } from "@/application/dtos/match-output";
import { MatchScoreBar } from "./MatchScoreBar";

interface ProposalCardProps {
  candidate: MatchCandidateOutput;
  onPropose: () => void;
}

export function ProposalCard({ candidate, onPropose }: ProposalCardProps) {
  return (
    <div
      className="border rounded-lg p-4 hover:border-blue-400 transition-colors"
      role="listitem"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-sm text-gray-500">생각의 차이</span>
          <p className="font-medium">
            {(candidate.distance * 100).toFixed(0)}%
          </p>
        </div>
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
          적정 거리
        </span>
      </div>

      <MatchScoreBar score={candidate.score} />

      <div className="mt-3 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          대화 준비도: {(candidate.readiness * 100).toFixed(0)}%
        </span>
        <button
          onClick={onPropose}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          aria-label="대화 제안하기"
        >
          대화 제안
        </button>
      </div>
    </div>
  );
}
