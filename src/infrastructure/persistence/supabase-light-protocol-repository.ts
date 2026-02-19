import type { SupabaseClient } from "@supabase/supabase-js";
import type { LightProtocolRepository } from "@/domain/interfaces/light-protocol-repository";
import {
  LightProtocolSession,
  type LightProtocolSessionProps,
} from "@/domain/entities/light-protocol-session";
import type { LightProtocolType } from "@/domain/value-objects/light-protocol-type";

interface LightProtocolRow {
  id: string;
  friendship_id: string;
  type: string;
  initiator_id: string;
  status: string;
  initiator_response: Record<string, string> | null;
  responder_response: Record<string, string> | null;
  created_at: string;
  completed_at: string | null;
}

function toEntity(row: LightProtocolRow): LightProtocolSession {
  return LightProtocolSession.reconstitute({
    id: row.id,
    friendshipId: row.friendship_id,
    type: row.type as LightProtocolType,
    initiatorId: row.initiator_id,
    status: row.status as LightProtocolSessionProps["status"],
    initiatorResponse: row.initiator_response,
    responderResponse: row.responder_response,
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
  });
}

export class SupabaseLightProtocolRepository
  implements LightProtocolRepository
{
  constructor(private readonly supabase: SupabaseClient) {}

  async save(session: LightProtocolSession): Promise<void> {
    const { error } = await this.supabase
      .from("light_protocol_sessions")
      .insert({
        id: session.id,
        friendship_id: session.friendshipId,
        type: session.type,
        initiator_id: session.initiatorId,
        status: session.status,
        initiator_response: session.initiatorResponse,
        responder_response: session.responderResponse,
        created_at: session.createdAt.toISOString(),
        completed_at: session.completedAt?.toISOString() ?? null,
      });
    if (error) throw error;
  }

  async findById(id: string): Promise<LightProtocolSession | null> {
    const { data, error } = await this.supabase
      .from("light_protocol_sessions")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return toEntity(data as LightProtocolRow);
  }

  async findByFriendship(
    friendshipId: string,
  ): Promise<LightProtocolSession[]> {
    const { data, error } = await this.supabase
      .from("light_protocol_sessions")
      .select("*")
      .eq("friendship_id", friendshipId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as LightProtocolRow[]).map(toEntity);
  }

  async findActiveByFriendship(
    friendshipId: string,
  ): Promise<LightProtocolSession | null> {
    const { data, error } = await this.supabase
      .from("light_protocol_sessions")
      .select("*")
      .eq("friendship_id", friendshipId)
      .eq("status", "ACTIVE")
      .single();
    if (error || !data) return null;
    return toEntity(data as LightProtocolRow);
  }

  async update(session: LightProtocolSession): Promise<void> {
    const { error } = await this.supabase
      .from("light_protocol_sessions")
      .update({
        status: session.status,
        initiator_response: session.initiatorResponse,
        responder_response: session.responderResponse,
        completed_at: session.completedAt?.toISOString() ?? null,
      })
      .eq("id", session.id);
    if (error) throw error;
  }
}
