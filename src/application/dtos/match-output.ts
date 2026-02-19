import type { FacilitatorIntensity, ReflectionLevel } from "@/domain/services/distance-safety-package";

export interface MatchCandidateOutput {
  sessionId: string;
  distance: number;
  readiness: number;
  score: number;
  inSweetSpot: boolean;
}

export interface AdaptiveMatchResult {
  candidates: MatchCandidateOutput[];
  bandMin: number;
  bandMax: number;
  topicLevelMin: number;
  topicLevelMax: number;
  facilitatorIntensity: FacilitatorIntensity;
  reflectionLevel: ReflectionLevel;
}

export interface MatchProposalOutput {
  id: string;
  initiatorSessionId: string;
  targetSessionId: string;
  score: number;
  status: string;
  topicLevel?: number;
  effortGrade?: string;
  facilitatorIntensity?: string;
  expiresAt: string;
  createdAt: string;
}

export interface RespondToProposalOutput {
  proposalId: string;
  status: string;
  dialogueSessionId: string | null;
}
