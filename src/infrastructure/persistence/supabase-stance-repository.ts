import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  StanceRepository,
  StanceProfile,
} from "@/domain/interfaces/stance-repository";
import { StanceVector } from "@/domain/entities/stance-vector";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import { ALL_DIMENSIONS } from "@/domain/value-objects/stance-dimension";

interface StanceRow {
  id: string;
  session_id: string;
  tech_reg: number;
  redistrib: number;
  work_life: number;
  meritocracy: number;
  tech_optim: number;
  opp_equality: number;
  map_type: string;
  reasoning: string | null;
  readiness: number;
  precision: string;
  created_at: string;
  updated_at: string;
}

const DIMENSION_TO_COLUMN: Record<StanceDimension, string> = {
  TECH_REGULATION: "tech_reg",
  REDISTRIBUTION: "redistrib",
  WORK_LIFE: "work_life",
  MERITOCRACY: "meritocracy",
  TECH_OPTIMISM: "tech_optim",
  OPPORTUNITY_EQUALITY: "opp_equality",
};

export class SupabaseStanceRepository implements StanceRepository {
  constructor(private readonly client: SupabaseClient) {}

  async save(profile: StanceProfile): Promise<void> {
    const row = this.toRow(profile);
    const { error } = await this.client
      .from("stance_profiles")
      .insert(row);

    if (error) {
      throw new Error(`Failed to save stance profile: ${error.message}`);
    }
  }

  async findBySessionId(
    sessionId: string,
  ): Promise<StanceProfile | null> {
    const { data, error } = await this.client
      .from("stance_profiles")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(
        `Failed to find stance profile: ${error.message}`,
      );
    }

    return this.toDomain(data as StanceRow);
  }

  async update(
    sessionId: string,
    updates: Partial<
      Pick<
        StanceProfile,
        "vector" | "mapType" | "reasoning" | "readiness" | "precision"
      >
    >,
  ): Promise<void> {
    const row: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.vector) {
      const values = updates.vector.toValues();
      for (const dim of ALL_DIMENSIONS) {
        row[DIMENSION_TO_COLUMN[dim]] = values[dim];
      }
    }
    if (updates.mapType !== undefined) row.map_type = updates.mapType;
    if (updates.reasoning !== undefined) row.reasoning = updates.reasoning;
    if (updates.readiness !== undefined) row.readiness = updates.readiness;
    if (updates.precision !== undefined) row.precision = updates.precision;

    const { error } = await this.client
      .from("stance_profiles")
      .update(row)
      .eq("session_id", sessionId);

    if (error) {
      throw new Error(
        `Failed to update stance profile: ${error.message}`,
      );
    }
  }

  private toRow(
    profile: StanceProfile,
  ): Record<string, unknown> {
    const values = profile.vector.toValues();
    return {
      id: profile.id,
      session_id: profile.sessionId,
      tech_reg: values.TECH_REGULATION,
      redistrib: values.REDISTRIBUTION,
      work_life: values.WORK_LIFE,
      meritocracy: values.MERITOCRACY,
      tech_optim: values.TECH_OPTIMISM,
      opp_equality: values.OPPORTUNITY_EQUALITY,
      map_type: profile.mapType,
      reasoning: profile.reasoning,
      readiness: profile.readiness,
      precision: profile.precision,
      created_at: profile.createdAt.toISOString(),
      updated_at: profile.updatedAt.toISOString(),
    };
  }

  private toDomain(row: StanceRow): StanceProfile {
    const vector = StanceVector.fromValues({
      TECH_REGULATION: row.tech_reg,
      REDISTRIBUTION: row.redistrib,
      WORK_LIFE: row.work_life,
      MERITOCRACY: row.meritocracy,
      TECH_OPTIMISM: row.tech_optim,
      OPPORTUNITY_EQUALITY: row.opp_equality,
    });

    return {
      id: row.id,
      sessionId: row.session_id,
      vector,
      mapType: row.map_type,
      reasoning: row.reasoning,
      readiness: row.readiness,
      precision: row.precision as "initial" | "refined",
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
