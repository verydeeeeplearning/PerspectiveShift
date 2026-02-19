"use client";

import type { MatchCandidateOutput } from "@/application/dtos/match-output";
import { ProposalCard } from "./ProposalCard";

interface CandidateListProps {
  candidates: MatchCandidateOutput[];
  onPropose: (targetSessionId: string) => void;
}

export function CandidateList({
  candidates,
  onPropose,
}: CandidateListProps) {
  return (
    <div className="space-y-4" role="list" aria-label="매칭 후보 목록">
      {candidates.map((candidate) => (
        <ProposalCard
          key={candidate.sessionId}
          candidate={candidate}
          onPropose={() => onPropose(candidate.sessionId)}
        />
      ))}
    </div>
  );
}
