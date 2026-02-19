import type { SupabaseClient } from "@supabase/supabase-js";
import type { MeetingRepository } from "@/domain/interfaces/meeting-repository";
import { OfflineMeeting } from "@/domain/entities/offline-meeting";
import type { MeetingStatus } from "@/domain/value-objects/meeting-status";
import type { SafetyCheckinStatus } from "@/domain/value-objects/safety-checkin-status";

interface MeetingRow {
  id: string;
  friendship_id: string;
  proposer_id: string;
  status: string;
  safety_checkin_status: string;
  proposed_at: string | null;
  location_hint: string | null;
  created_at: string;
  updated_at: string;
}

export class SupabaseMeetingRepository implements MeetingRepository {
  constructor(private readonly client: SupabaseClient) {}

  async save(meeting: OfflineMeeting): Promise<void> {
    const { error } = await this.client
      .from("offline_meeting_proposals")
      .insert({
        id: meeting.id,
        friendship_id: meeting.friendshipId,
        proposer_id: meeting.proposerId,
        status: meeting.status,
        safety_checkin_status: meeting.safetyCheckinStatus,
        proposed_at: meeting.proposedAt?.toISOString() ?? null,
        location_hint: meeting.locationHint,
        created_at: meeting.createdAt.toISOString(),
        updated_at: meeting.updatedAt.toISOString(),
      });

    if (error)
      throw new Error(`Failed to save meeting: ${error.message}`);
  }

  async findById(id: string): Promise<OfflineMeeting | null> {
    const { data, error } = await this.client
      .from("offline_meeting_proposals")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error)
      throw new Error(`Failed to find meeting: ${error.message}`);
    if (!data) return null;

    return this.rowToMeeting(data as MeetingRow);
  }

  async findByFriendship(
    friendshipId: string,
  ): Promise<OfflineMeeting[]> {
    const { data, error } = await this.client
      .from("offline_meeting_proposals")
      .select("*")
      .eq("friendship_id", friendshipId)
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(`Failed to find meetings: ${error.message}`);

    return (data ?? []).map((row) =>
      this.rowToMeeting(row as MeetingRow),
    );
  }

  async update(meeting: OfflineMeeting): Promise<void> {
    const { error } = await this.client
      .from("offline_meeting_proposals")
      .update({
        status: meeting.status,
        safety_checkin_status: meeting.safetyCheckinStatus,
        updated_at: meeting.updatedAt.toISOString(),
      })
      .eq("id", meeting.id);

    if (error)
      throw new Error(`Failed to update meeting: ${error.message}`);
  }

  private rowToMeeting(row: MeetingRow): OfflineMeeting {
    return OfflineMeeting.create({
      id: row.id,
      friendshipId: row.friendship_id,
      proposerId: row.proposer_id,
      status: row.status as MeetingStatus,
      safetyCheckinStatus: row.safety_checkin_status as SafetyCheckinStatus,
      proposedAt: row.proposed_at ? new Date(row.proposed_at) : null,
      locationHint: row.location_hint,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
