import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRepository } from "@/domain/interfaces/user-repository";
import { UserProfile } from "@/domain/entities/user-profile";

interface UserProfileRow {
  user_id: string;
  display_alias: string;
  claimed_session_ids: string[];
  created_at: string;
  updated_at: string;
}

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(`Failed to find user: ${error.message}`);
    if (!data) return null;

    return this.rowToProfile(data as UserProfileRow);
  }

  async findBySessionId(sessionId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from("user_profiles")
      .select("*")
      .contains("claimed_session_ids", [sessionId])
      .maybeSingle();

    if (error) throw new Error(`Failed to find user by session: ${error.message}`);
    if (!data) return null;

    return this.rowToProfile(data as UserProfileRow);
  }

  async save(profile: UserProfile): Promise<void> {
    const { error } = await this.client.from("user_profiles").insert({
      user_id: profile.userId,
      display_alias: profile.displayAlias,
      claimed_session_ids: [...profile.claimedSessionIds],
      created_at: profile.createdAt.toISOString(),
      updated_at: profile.updatedAt.toISOString(),
    });

    if (error) throw new Error(`Failed to save user: ${error.message}`);
  }

  async update(profile: UserProfile): Promise<void> {
    const { error } = await this.client
      .from("user_profiles")
      .update({
        display_alias: profile.displayAlias,
        claimed_session_ids: [...profile.claimedSessionIds],
        updated_at: profile.updatedAt.toISOString(),
      })
      .eq("user_id", profile.userId);

    if (error) throw new Error(`Failed to update user: ${error.message}`);
  }

  private rowToProfile(row: UserProfileRow): UserProfile {
    return UserProfile.create({
      userId: row.user_id,
      displayAlias: row.display_alias,
      claimedSessionIds: row.claimed_session_ids ?? [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
