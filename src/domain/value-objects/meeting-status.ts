export const MEETING_STATUSES = [
  "PROPOSED",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export function isValidMeetingStatus(
  value: string,
): value is MeetingStatus {
  return MEETING_STATUSES.includes(value as MeetingStatus);
}
