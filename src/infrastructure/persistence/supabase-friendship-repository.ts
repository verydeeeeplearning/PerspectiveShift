import type { SupabaseClient } from "@supabase/supabase-js";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import { Friendship } from "@/domain/entities/friendship";
import type { FriendshipStatus } from "@/domain/value-objects/friendship-status";

interface FriendshipRow {
  id: string;
  user_a: string;
  user_b: string;
  status: string;
  dialogue_count: number;
  created_at: string;
  updated_at: string;
}

export class SupabaseFriendshipRepository
  implements FriendshipRepository
{
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<Friendship | null> {
    const { data, error } = await this.client
      .from("friendships")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error)
      throw new Error(`Failed to find friendship: ${error.message}`);
    if (!data) return null;

    return this.rowToFriendship(data as FriendshipRow);
  }

  async findByUsers(
    userA: string,
    userB: string,
  ): Promise<Friendship | null> {
    const [a, b] = Friendship.normalizePair(userA, userB);
    const { data, error } = await this.client
      .from("friendships")
      .select("*")
      .eq("user_a", a)
      .eq("user_b", b)
      .maybeSingle();

    if (error)
      throw new Error(`Failed to find friendship: ${error.message}`);
    if (!data) return null;

    return this.rowToFriendship(data as FriendshipRow);
  }

  async findByUser(userId: string): Promise<Friendship[]> {
    const { data, error } = await this.client
      .from("friendships")
      .select("*")
      .or(`user_a.eq.${userId},user_b.eq.${userId}`);

    if (error)
      throw new Error(`Failed to find friendships: ${error.message}`);

    return (data ?? []).map((row) =>
      this.rowToFriendship(row as FriendshipRow),
    );
  }

  async save(friendship: Friendship): Promise<void> {
    const { error } = await this.client.from("friendships").insert({
      id: friendship.id,
      user_a: friendship.userA,
      user_b: friendship.userB,
      status: friendship.status,
      dialogue_count: friendship.dialogueCount,
      created_at: friendship.createdAt.toISOString(),
      updated_at: friendship.updatedAt.toISOString(),
    });

    if (error)
      throw new Error(`Failed to save friendship: ${error.message}`);
  }

  async update(friendship: Friendship): Promise<void> {
    const { error } = await this.client
      .from("friendships")
      .update({
        status: friendship.status,
        dialogue_count: friendship.dialogueCount,
        updated_at: friendship.updatedAt.toISOString(),
      })
      .eq("id", friendship.id);

    if (error)
      throw new Error(`Failed to update friendship: ${error.message}`);
  }

  private rowToFriendship(row: FriendshipRow): Friendship {
    return Friendship.create({
      id: row.id,
      userA: row.user_a,
      userB: row.user_b,
      status: row.status as FriendshipStatus,
      dialogueCount: row.dialogue_count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
