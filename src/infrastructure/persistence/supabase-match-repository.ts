import type { SupabaseClient } from "@supabase/supabase-js";
import type { MatchRepository } from "@/domain/interfaces/match-repository";
import type { StanceProfile } from "@/domain/interfaces/stance-repository";
import { MatchProposal } from "@/domain/entities/match-proposal";
import { OpinionDistance } from "@/domain/value-objects/opinion-distance";
import { ReadinessScore } from "@/domain/value-objects/readiness-score";
import { MatchScore } from "@/domain/value-objects/match-score";
import { StanceVector } from "@/domain/entities/stance-vector";

interface ProposalRow {
  id: string;
  initiator_session_id: string;
  target_session_id: string;
  distance_fit: number;
  readiness_component: number;
  score: number;
  status: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseMatchRepository implements MatchRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findCandidateProfiles(
    excludeSessionId: string,
  ): Promise<StanceProfile[]> {
    const { data, error } = await this.client
      .from("stance_profiles")
      .select("*")
      .neq("session_id", excludeSessionId);

    if (error) throw new Error(`Failed to query profiles: ${error.message}`);

    return (data ?? []).map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      vector: StanceVector.fromValues({
        TECH_REGULATION: row.tech_reg,
        REDISTRIBUTION: row.redistrib,
        WORK_LIFE: row.work_life,
        MERITOCRACY: row.meritocracy,
        TECH_OPTIMISM: row.tech_optim,
        OPPORTUNITY_EQUALITY: row.opp_equality,
      }),
      mapType: row.map_type,
      reasoning: row.reasoning,
      readiness: row.readiness,
      precision: row.precision as "initial" | "refined",
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async saveProposal(proposal: MatchProposal): Promise<void> {
    const { error } = await this.client
      .from("match_proposals")
      .insert({
        id: proposal.id,
        initiator_session_id: proposal.initiatorSessionId,
        target_session_id: proposal.targetSessionId,
        distance_fit: proposal.score.distanceFit,
        readiness_component: proposal.score.readinessComponent,
        score: proposal.score.value,
        status: proposal.status,
        expires_at: proposal.expiresAt.toISOString(),
        created_at: proposal.createdAt.toISOString(),
        updated_at: proposal.updatedAt.toISOString(),
      });

    if (error) throw new Error(`Failed to save proposal: ${error.message}`);
  }

  async findProposalById(id: string): Promise<MatchProposal | null> {
    const { data, error } = await this.client
      .from("match_proposals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to find proposal: ${error.message}`);
    }

    return this.rowToProposal(data as ProposalRow);
  }

  async findPendingProposal(
    initiatorId: string,
    targetId: string,
  ): Promise<MatchProposal | null> {
    const { data, error } = await this.client
      .from("match_proposals")
      .select("*")
      .eq("initiator_session_id", initiatorId)
      .eq("target_session_id", targetId)
      .eq("status", "PENDING")
      .maybeSingle();

    if (error) throw new Error(`Failed to find proposal: ${error.message}`);
    if (!data) return null;

    return this.rowToProposal(data as ProposalRow);
  }

  async updateProposal(proposal: MatchProposal): Promise<void> {
    const { error } = await this.client
      .from("match_proposals")
      .update({
        status: proposal.status,
        updated_at: proposal.updatedAt.toISOString(),
      })
      .eq("id", proposal.id);

    if (error) throw new Error(`Failed to update proposal: ${error.message}`);
  }

  private rowToProposal(row: ProposalRow): MatchProposal {
    const distance = OpinionDistance.create(
      Math.min(2, Math.max(0, row.distance_fit)),
    );
    const readiness = ReadinessScore.create(
      Math.min(1, Math.max(0, row.readiness_component)),
    );
    const score = MatchScore.calculate(distance, readiness);

    return MatchProposal.create({
      id: row.id,
      initiatorSessionId: row.initiator_session_id,
      targetSessionId: row.target_session_id,
      score,
      status: row.status as "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED",
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
