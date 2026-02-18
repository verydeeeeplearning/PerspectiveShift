import type { SupabaseClient } from "@supabase/supabase-js";
import type { FriendRepository } from "@/domain/interfaces/friend-repository";
import { FriendRequest } from "@/domain/entities/friend-request";
import type { FriendRequestStatus } from "@/domain/value-objects/friend-request-status";

interface FriendRequestRow {
  id: string;
  requester_id: string;
  target_id: string;
  dialogue_session_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseFriendRepository implements FriendRepository {
  constructor(private readonly client: SupabaseClient) {}

  async save(request: FriendRequest): Promise<void> {
    const { error } = await this.client
      .from("friend_requests")
      .insert({
        id: request.id,
        requester_id: request.requesterId,
        target_id: request.targetId,
        dialogue_session_id: request.dialogueSessionId,
        status: request.status,
        created_at: request.createdAt.toISOString(),
        updated_at: request.updatedAt.toISOString(),
      });

    if (error)
      throw new Error(`Failed to save friend request: ${error.message}`);
  }

  async findById(id: string): Promise<FriendRequest | null> {
    const { data, error } = await this.client
      .from("friend_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error)
      throw new Error(`Failed to find friend request: ${error.message}`);
    if (!data) return null;

    return this.rowToRequest(data as FriendRequestRow);
  }

  async findPending(
    requesterId: string,
    targetId: string,
  ): Promise<FriendRequest | null> {
    const { data, error } = await this.client
      .from("friend_requests")
      .select("*")
      .eq("requester_id", requesterId)
      .eq("target_id", targetId)
      .eq("status", "PENDING")
      .maybeSingle();

    if (error)
      throw new Error(`Failed to find pending request: ${error.message}`);
    if (!data) return null;

    return this.rowToRequest(data as FriendRequestRow);
  }

  async findPendingForUser(
    userId: string,
  ): Promise<FriendRequest[]> {
    const { data, error } = await this.client
      .from("friend_requests")
      .select("*")
      .eq("target_id", userId)
      .eq("status", "PENDING");

    if (error)
      throw new Error(`Failed to find pending requests: ${error.message}`);

    return (data ?? []).map((row) =>
      this.rowToRequest(row as FriendRequestRow),
    );
  }

  async update(request: FriendRequest): Promise<void> {
    const { error } = await this.client
      .from("friend_requests")
      .update({
        status: request.status,
        updated_at: request.updatedAt.toISOString(),
      })
      .eq("id", request.id);

    if (error)
      throw new Error(`Failed to update friend request: ${error.message}`);
  }

  private rowToRequest(row: FriendRequestRow): FriendRequest {
    return FriendRequest.create({
      id: row.id,
      requesterId: row.requester_id,
      targetId: row.target_id,
      dialogueSessionId: row.dialogue_session_id,
      status: row.status as FriendRequestStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
