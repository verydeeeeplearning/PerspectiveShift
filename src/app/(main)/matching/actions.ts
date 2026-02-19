"use server";

import { getContainer } from "@/infrastructure/config/di-container";

export async function findCandidates(sessionId: string) {
  const container = getContainer();
  return container.findMatchCandidatesUseCase.execute(sessionId);
}

export async function createProposal(
  initiatorSessionId: string,
  targetSessionId: string,
) {
  const container = getContainer();
  return container.createMatchProposalUseCase.execute(
    initiatorSessionId,
    targetSessionId,
  );
}

export async function respondToProposal(
  proposalId: string,
  sessionId: string,
  accept: boolean,
) {
  const container = getContainer();
  return container.respondToProposalUseCase.execute(
    proposalId,
    sessionId,
    accept,
  );
}
