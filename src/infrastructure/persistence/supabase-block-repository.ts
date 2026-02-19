import type { SupabaseClient } from "@supabase/supabase-js";
import type { BlockRepository } from "@/domain/interfaces/block-repository";

export class SupabaseBlockRepository implements BlockRepository {
  constructor(private readonly client: SupabaseClient) {}

  async isBlocked(
    blockerId: string,
    blockedId: string,
  ): Promise<boolean> {
    const { data, error } = await this.client
      .from("user_blocks")
      .select("id")
      .eq("blocker_id", blockerId)
      .eq("blocked_id", blockedId)
      .maybeSingle();

    if (error)
      throw new Error(`Failed to check block: ${error.message}`);
    return !!data;
  }

  async isBlockedEitherDirection(
    userId1: string,
    userId2: string,
  ): Promise<boolean> {
    const { data, error } = await this.client
      .from("user_blocks")
      .select("id")
      .or(
        `and(blocker_id.eq.${userId1},blocked_id.eq.${userId2}),and(blocker_id.eq.${userId2},blocked_id.eq.${userId1})`,
      )
      .limit(1);

    if (error)
      throw new Error(`Failed to check block: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }

  async block(
    blockerId: string,
    blockedId: string,
  ): Promise<void> {
    const { error } = await this.client
      .from("user_blocks")
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
      });

    if (error)
      throw new Error(`Failed to block user: ${error.message}`);
  }

  async unblock(
    blockerId: string,
    blockedId: string,
  ): Promise<void> {
    const { error } = await this.client
      .from("user_blocks")
      .delete()
      .eq("blocker_id", blockerId)
      .eq("blocked_id", blockedId);

    if (error)
      throw new Error(`Failed to unblock user: ${error.message}`);
  }
}
