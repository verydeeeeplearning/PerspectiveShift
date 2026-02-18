export interface OfflineMeetingOutput {
  id: string;
  friendshipId: string;
  proposerId: string;
  status: string;
  safetyCheckinStatus: string;
  proposedAt: string | null;
  locationHint: string | null;
  createdAt: string;
}
