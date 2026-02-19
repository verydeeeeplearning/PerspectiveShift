export const SAFETY_REPORT_STATUSES = [
  "OPEN",
  "REVIEWING",
  "RESOLVED",
  "DISMISSED",
] as const;

export type SafetyReportStatus =
  (typeof SAFETY_REPORT_STATUSES)[number];

export function isValidSafetyReportStatus(
  value: string,
): value is SafetyReportStatus {
  return SAFETY_REPORT_STATUSES.includes(value as SafetyReportStatus);
}
