export const FRIEND_REQUEST_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "SILENT_REJECTED",
] as const;

export type FriendRequestStatus =
  (typeof FRIEND_REQUEST_STATUSES)[number];

export function isResolvedFriendRequest(
  status: FriendRequestStatus,
): boolean {
  return status !== "PENDING";
}

export function isValidFriendRequestStatus(
  value: string,
): value is FriendRequestStatus {
  return FRIEND_REQUEST_STATUSES.includes(value as FriendRequestStatus);
}
