import type { OfflineMeeting } from "../entities/offline-meeting";

export interface MeetingRepository {
  save(meeting: OfflineMeeting): Promise<void>;

  findById(id: string): Promise<OfflineMeeting | null>;

  findByFriendship(friendshipId: string): Promise<OfflineMeeting[]>;

  update(meeting: OfflineMeeting): Promise<void>;
}
