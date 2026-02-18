export const FRIENDSHIP_STATUSES = [
  "ACTIVE",
  "UNMATCHED",
  "BLOCKED",
] as const;

export type FriendshipStatus =
  (typeof FRIENDSHIP_STATUSES)[number];

export function isValidFriendshipStatus(
  value: string,
): value is FriendshipStatus {
  return FRIENDSHIP_STATUSES.includes(value as FriendshipStatus);
}
