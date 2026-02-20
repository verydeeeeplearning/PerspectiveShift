import type { SupabaseClient } from "@supabase/supabase-js";
import type { FollowUpCheckinRepository } from "@/domain/interfaces/follow-up-checkin-repository";
import { FollowUpCheckin } from "@/domain/entities/follow-up-checkin";

interface FollowUpRow {
  id: string;
  dialogue_session_id: string;
  participant_id: string;
  scheduled_at: string;
  avoidance_reduction: number | null;
  completed_at: string | null;
  created_at: string;
}

function toEntity(row: FollowUpRow): FollowUpCheckin {
  return FollowUpCheckin.create({
    id: row.id,
    dialogueSessionId: row.dialogue_session_id,
    participantId: row.participant_id,
    scheduledAt: new Date(row.scheduled_at),
    avoidanceReduction: row.avoidance_reduction,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
    createdAt: new Date(row.created_at),
  });
}

export class SupabaseFollowUpRepository implements FollowUpCheckinRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async save(checkin: FollowUpCheckin): Promise<void> {
    const { error } = await this.supabase.from("follow_up_checkins").upsert(
      {
        id: checkin.id,
        dialogue_session_id: checkin.dialogueSessionId,
        participant_id: checkin.participantId,
        scheduled_at: checkin.scheduledAt.toISOString(),
        avoidance_reduction: checkin.avoidanceReduction,
        completed_at: checkin.completedAt?.toISOString() ?? null,
        created_at: checkin.createdAt.toISOString(),
      },
      { onConflict: "dialogue_session_id,participant_id" },
    );
    if (error) throw error;
  }

  async findById(id: string): Promise<FollowUpCheckin | null> {
    const { data, error } = await this.supabase
      .from("follow_up_checkins")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return toEntity(data as FollowUpRow);
  }

  async findBySessionAndParticipant(
    sessionId: string,
    participantId: string,
  ): Promise<FollowUpCheckin | null> {
    const { data, error } = await this.supabase
      .from("follow_up_checkins")
      .select("*")
      .eq("dialogue_session_id", sessionId)
      .eq("participant_id", participantId)
      .single();
    if (error || !data) return null;
    return toEntity(data as FollowUpRow);
  }

  async findPendingByParticipant(
    participantId: string,
  ): Promise<FollowUpCheckin[]> {
    const { data, error } = await this.supabase
      .from("follow_up_checkins")
      .select("*")
      .eq("participant_id", participantId)
      .is("completed_at", null)
      .order("scheduled_at", { ascending: true });
    if (error || !data) return [];
    return (data as FollowUpRow[]).map(toEntity);
  }

  async update(checkin: FollowUpCheckin): Promise<void> {
    const { error } = await this.supabase
      .from("follow_up_checkins")
      .update({
        avoidance_reduction: checkin.avoidanceReduction,
        completed_at: checkin.completedAt?.toISOString() ?? null,
      })
      .eq("id", checkin.id);
    if (error) throw error;
  }
}
