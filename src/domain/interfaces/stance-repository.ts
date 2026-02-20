import type { StanceVector } from "../entities/stance-vector";
import type { CoreValueKey } from "../value-objects/core-value";
import type { ConfidenceLevelKey } from "../value-objects/confidence-level";
import type { StanceDimension } from "../value-objects/stance-dimension";

export interface StanceProfile {
  id: string;
  sessionId: string;
  vector: StanceVector;
  mapType: string;
  reasoning: string | null;
  readiness: number;
  precision: "initial" | "refined";
  coreValue?: CoreValueKey | null;
  selfAffirmationExperience?: string | null;
  confidenceMap?: Record<StanceDimension, ConfidenceLevelKey> | null;
  ageGroup?: string | null;
  jobCategory?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StanceRepository {
  save(profile: StanceProfile): Promise<void>;
  findBySessionId(sessionId: string): Promise<StanceProfile | null>;
  update(
    sessionId: string,
    updates: Partial<
      Pick<
        StanceProfile,
        "vector" | "mapType" | "reasoning" | "readiness" | "precision" | "coreValue" | "selfAffirmationExperience" | "confidenceMap" | "ageGroup" | "jobCategory"
      >
    >,
  ): Promise<void>;
}
