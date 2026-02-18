export const SAFETY_REASONS = ["HARASSMENT", "THREAT", "PII_REQUEST", "IMPERSONATION", "OTHER"] as const;
export type SafetyReason = (typeof SAFETY_REASONS)[number];
export function isValidSafetyReason(value: string): value is SafetyReason {
  return SAFETY_REASONS.includes(value as SafetyReason);
}
