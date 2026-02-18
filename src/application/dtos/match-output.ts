export interface MatchCandidateOutput {
  sessionId: string;
  distance: number;
  readiness: number;
  score: number;
  inSweetSpot: boolean;
}

export interface MatchProposalOutput {
  id: string;
  initiatorSessionId: string;
  targetSessionId: string;
  score: number;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface RespondToProposalOutput {
  proposalId: string;
  status: string;
  dialogueSessionId: string | null;
}
