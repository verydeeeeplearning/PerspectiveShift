import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import type { MatchRepository } from "@/domain/interfaces/match-repository";
import type { MatchProposalOutput } from "../dtos/match-output";
import { OpinionDistance } from "@/domain/value-objects/opinion-distance";
import { ReadinessScore } from "@/domain/value-objects/readiness-score";
import { MatchScore } from "@/domain/value-objects/match-score";
import { MatchProposal } from "@/domain/entities/match-proposal";
import { DuplicateProposalError } from "@/domain/errors/domain-errors";

const PROPOSAL_EXPIRY_HOURS = 48;

export interface CreateMatchProposalDeps {
  stanceRepository: StanceRepository;
  matchRepository: MatchRepository;
}

export class CreateMatchProposalUseCase {
  private deps: CreateMatchProposalDeps;

  constructor(deps: CreateMatchProposalDeps) {
    this.deps = deps;
  }

  async execute(
    initiatorSessionId: string,
    targetSessionId: string,
  ): Promise<MatchProposalOutput> {
    const existing =
      await this.deps.matchRepository.findPendingProposal(
        initiatorSessionId,
        targetSessionId,
      );
    if (existing) {
      throw new DuplicateProposalError(
        initiatorSessionId,
        targetSessionId,
      );
    }

    const initiatorProfile =
      await this.deps.stanceRepository.findBySessionId(
        initiatorSessionId,
      );
    const targetProfile =
      await this.deps.stanceRepository.findBySessionId(
        targetSessionId,
      );

    if (!initiatorProfile || !targetProfile) {
      throw new Error("One or both profiles not found");
    }

    const distanceValue = initiatorProfile.vector.cosineDistance(
      targetProfile.vector,
    );
    const distance = OpinionDistance.create(distanceValue);
    const readiness = ReadinessScore.create(targetProfile.readiness);
    const score = MatchScore.calculate(distance, readiness);

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + PROPOSAL_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    const proposal = MatchProposal.create({
      id: crypto.randomUUID(),
      initiatorSessionId,
      targetSessionId,
      score,
      status: "PENDING",
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    await this.deps.matchRepository.saveProposal(proposal);

    return {
      id: proposal.id,
      initiatorSessionId: proposal.initiatorSessionId,
      targetSessionId: proposal.targetSessionId,
      score: proposal.score.value,
      status: proposal.status,
      expiresAt: proposal.expiresAt.toISOString(),
      createdAt: proposal.createdAt.toISOString(),
    };
  }
}
