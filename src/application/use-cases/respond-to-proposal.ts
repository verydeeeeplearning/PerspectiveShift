import type { MatchRepository } from "@/domain/interfaces/match-repository";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { RespondToProposalOutput } from "../dtos/match-output";
import { DialogueSession } from "@/domain/entities/dialogue-session";
import {
  UnauthorizedParticipantError,
  ProposalAlreadyResolvedError,
} from "@/domain/errors/domain-errors";

export interface RespondToProposalDeps {
  matchRepository: MatchRepository;
  dialogueRepository: DialogueRepository;
}

export class RespondToProposalUseCase {
  private deps: RespondToProposalDeps;

  constructor(deps: RespondToProposalDeps) {
    this.deps = deps;
  }

  async execute(
    proposalId: string,
    sessionId: string,
    accept: boolean,
  ): Promise<RespondToProposalOutput> {
    const proposal =
      await this.deps.matchRepository.findProposalById(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.targetSessionId !== sessionId) {
      throw new UnauthorizedParticipantError(sessionId);
    }

    if (proposal.status !== "PENDING") {
      throw new ProposalAlreadyResolvedError(
        proposalId,
        proposal.status,
      );
    }

    if (proposal.isExpired()) {
      proposal.expire();
      await this.deps.matchRepository.updateProposal(proposal);
      return {
        proposalId,
        status: "EXPIRED",
        dialogueSessionId: null,
      };
    }

    let dialogueSessionId: string | null = null;

    if (accept) {
      proposal.accept();

      const now = new Date();
      const session = DialogueSession.create({
        id: crypto.randomUUID(),
        participantA: proposal.initiatorSessionId,
        participantB: proposal.targetSessionId,
        currentStep: "POSITION",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
      });

      await this.deps.dialogueRepository.saveSession(session);
      dialogueSessionId = session.id;
    } else {
      proposal.reject();
    }

    await this.deps.matchRepository.updateProposal(proposal);

    return {
      proposalId,
      status: proposal.status,
      dialogueSessionId,
    };
  }
}
