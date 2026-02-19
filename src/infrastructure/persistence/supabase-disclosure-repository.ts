import type { SupabaseClient } from "@supabase/supabase-js";
import type { DisclosureRepository } from "@/domain/interfaces/disclosure-repository";
import { DisclosureSetting } from "@/domain/entities/disclosure-setting";
import { DisclosureLevel } from "@/domain/value-objects/disclosure-level";

interface DisclosureRow {
  id: string;
  friendship_id: string;
  from_user_id: string;
  to_user_id: string;
  level: number;
  updated_at: string;
}

export class SupabaseDisclosureRepository
  implements DisclosureRepository
{
  constructor(private readonly client: SupabaseClient) {}

  async findByFriendship(
    friendshipId: string,
  ): Promise<DisclosureSetting[]> {
    const { data, error } = await this.client
      .from("friend_disclosures")
      .select("*")
      .eq("friendship_id", friendshipId);

    if (error)
      throw new Error(`Failed to find disclosures: ${error.message}`);

    return (data ?? []).map((row) =>
      this.rowToSetting(row as DisclosureRow),
    );
  }

  async findByDirection(
    friendshipId: string,
    fromUserId: string,
    toUserId: string,
  ): Promise<DisclosureSetting | null> {
    const { data, error } = await this.client
      .from("friend_disclosures")
      .select("*")
      .eq("friendship_id", friendshipId)
      .eq("from_user_id", fromUserId)
      .eq("to_user_id", toUserId)
      .maybeSingle();

    if (error)
      throw new Error(`Failed to find disclosure: ${error.message}`);
    if (!data) return null;

    return this.rowToSetting(data as DisclosureRow);
  }

  async save(setting: DisclosureSetting): Promise<void> {
    const { error } = await this.client
      .from("friend_disclosures")
      .insert({
        id: setting.id,
        friendship_id: setting.friendshipId,
        from_user_id: setting.fromUserId,
        to_user_id: setting.toUserId,
        level: setting.level.value,
        updated_at: setting.updatedAt.toISOString(),
      });

    if (error)
      throw new Error(`Failed to save disclosure: ${error.message}`);
  }

  async update(setting: DisclosureSetting): Promise<void> {
    const { error } = await this.client
      .from("friend_disclosures")
      .update({
        level: setting.level.value,
        updated_at: setting.updatedAt.toISOString(),
      })
      .eq("id", setting.id);

    if (error)
      throw new Error(`Failed to update disclosure: ${error.message}`);
  }

  private rowToSetting(row: DisclosureRow): DisclosureSetting {
    return DisclosureSetting.create({
      id: row.id,
      friendshipId: row.friendship_id,
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      level: DisclosureLevel.create(row.level),
      updatedAt: new Date(row.updated_at),
    });
  }
}
