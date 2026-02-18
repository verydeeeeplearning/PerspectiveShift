export const PROPOSAL_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export function isResolved(status: ProposalStatus): boolean {
  return status !== "PENDING";
}

export function isValidProposalStatus(
  value: string,
): value is ProposalStatus {
  return PROPOSAL_STATUSES.includes(value as ProposalStatus);
}
