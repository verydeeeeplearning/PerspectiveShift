import type { ReceptivenessScore } from "../value-objects/receptiveness-score";

export interface ReceptivenessRepository {
  findByUserId(userId: string): Promise<ReceptivenessScore | null>;
  save(score: ReceptivenessScore): Promise<void>;
  countAllUsers(): Promise<number>;
  countUsersWithScoreBelow(points: number): Promise<number>;
}
