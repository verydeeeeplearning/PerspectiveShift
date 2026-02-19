import type { MatchProposal } from "../entities/match-proposal";
import type { StanceProfile } from "./stance-repository";

export interface MatchRepository {
  findCandidateProfiles(
    excludeSessionId: string,
  ): Promise<StanceProfile[]>;

  saveProposal(proposal: MatchProposal): Promise<void>;

  findProposalById(id: string): Promise<MatchProposal | null>;

  findPendingProposal(
    initiatorId: string,
    targetId: string,
  ): Promise<MatchProposal | null>;

  updateProposal(proposal: MatchProposal): Promise<void>;
}
