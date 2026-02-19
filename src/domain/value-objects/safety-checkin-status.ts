export const SAFETY_CHECKIN_STATUSES = [
  "PENDING",
  "SAFE",
  "CONCERN",
  "NO_RESPONSE",
] as const;

export type SafetyCheckinStatus =
  (typeof SAFETY_CHECKIN_STATUSES)[number];

export function isValidSafetyCheckinStatus(
  value: string,
): value is SafetyCheckinStatus {
  return SAFETY_CHECKIN_STATUSES.includes(
    value as SafetyCheckinStatus,
  );
}
