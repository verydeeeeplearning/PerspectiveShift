import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReceptivenessRepository } from "@/domain/interfaces/receptiveness-repository";
import { ReceptivenessScore } from "@/domain/value-objects/receptiveness-score";

interface ReceptivenessRow {
  user_id: string;
  total_points: number;
  template_adoptions: number;
  feel_heard_received: number;
  percentile: number | null;
}

function toEntity(row: ReceptivenessRow): ReceptivenessScore {
  return ReceptivenessScore.reconstitute({
    userId: row.user_id,
    totalPoints: row.total_points,
    templateAdoptions: row.template_adoptions,
    feelHeardReceived: row.feel_heard_received,
    percentile: row.percentile,
  });
}

export class SupabaseReceptivenessRepository
  implements ReceptivenessRepository
{
  constructor(private readonly supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<ReceptivenessScore | null> {
    const { data, error } = await this.supabase
      .from("receptiveness_entries")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error || !data) return null;
    return toEntity(data as ReceptivenessRow);
  }

  async save(score: ReceptivenessScore): Promise<void> {
    const { error } = await this.supabase.from("receptiveness_entries").upsert(
      {
        user_id: score.userId,
        total_points: score.totalPoints,
        template_adoptions: score.templateAdoptions,
        feel_heard_received: score.feelHeardReceived,
        percentile: score.percentile,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) throw error;
  }

  async countAllUsers(): Promise<number> {
    const { count, error } = await this.supabase
      .from("receptiveness_entries")
      .select("*", { count: "exact", head: true });
    if (error) return 0;
    return count ?? 0;
  }

  async countUsersWithScoreBelow(points: number): Promise<number> {
    const { count, error } = await this.supabase
      .from("receptiveness_entries")
      .select("*", { count: "exact", head: true })
      .lt("total_points", points);
    if (error) return 0;
    return count ?? 0;
  }
}
