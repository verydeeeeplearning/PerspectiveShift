import type { ReceptivenessRepository } from "@/domain/interfaces/receptiveness-repository";
import { ReceptivenessScore } from "@/domain/value-objects/receptiveness-score";

export interface UpdateReceptivenessDeps {
  receptivenessRepository: ReceptivenessRepository;
}

export interface ReceptivenessResult {
  userId: string;
  totalPoints: number;
  templateAdoptions: number;
  feelHeardReceived: number;
  percentile: number | null;
}

export class UpdateReceptivenessUseCase {
  constructor(private readonly deps: UpdateReceptivenessDeps) {}

  async addTemplateAdoption(userId: string): Promise<ReceptivenessResult> {
    const score = await this.getOrCreate(userId);
    const updated = score.addTemplateAdoption();
    await this.deps.receptivenessRepository.save(updated);
    return this.toResult(updated);
  }

  async addFeelHeardBonus(userId: string, feelHeardScore: number): Promise<ReceptivenessResult> {
    const score = await this.getOrCreate(userId);
    const updated = score.addFeelHeardBonus(feelHeardScore);
    await this.deps.receptivenessRepository.save(updated);
    return this.toResult(updated);
  }

  async getWithPercentile(userId: string): Promise<ReceptivenessResult> {
    const score = await this.getOrCreate(userId);
    const totalUsers = await this.deps.receptivenessRepository.countAllUsers();
    const usersBelow = await this.deps.receptivenessRepository.countUsersWithScoreBelow(score.totalPoints);
    const percentile = totalUsers > 0
      ? Math.round(100 - (usersBelow / totalUsers) * 100)
      : 50;
    const updated = score.withPercentile(percentile);
    return this.toResult(updated);
  }

  private async getOrCreate(userId: string): Promise<ReceptivenessScore> {
    const existing = await this.deps.receptivenessRepository.findByUserId(userId);
    return existing ?? ReceptivenessScore.initial(userId);
  }

  private toResult(score: ReceptivenessScore): ReceptivenessResult {
    return {
      userId: score.userId,
      totalPoints: score.totalPoints,
      templateAdoptions: score.templateAdoptions,
      feelHeardReceived: score.feelHeardReceived,
      percentile: score.percentile,
    };
  }
}
