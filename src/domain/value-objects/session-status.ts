export const SESSION_STATUSES = [
  "ACTIVE",
  "COMPLETED",
  "EXPIRED",
  "CANCELLED",
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export function isTerminal(status: SessionStatus): boolean {
  return status !== "ACTIVE";
}

export function isValidStatus(value: string): value is SessionStatus {
  return SESSION_STATUSES.includes(value as SessionStatus);
}
