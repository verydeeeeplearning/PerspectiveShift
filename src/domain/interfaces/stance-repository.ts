import type { StanceVector } from "../entities/stance-vector";

export interface StanceProfile {
  id: string;
  sessionId: string;
  vector: StanceVector;
  mapType: string;
  reasoning: string | null;
  readiness: number;
  precision: "initial" | "refined";
  createdAt: Date;
  updatedAt: Date;
}

export interface StanceRepository {
  save(profile: StanceProfile): Promise<void>;
  findBySessionId(sessionId: string): Promise<StanceProfile | null>;
  update(
    sessionId: string,
    updates: Partial<
      Pick<StanceProfile, "vector" | "mapType" | "reasoning" | "readiness" | "precision">
    >,
  ): Promise<void>;
}
