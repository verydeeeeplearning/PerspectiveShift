import { describe, it, expect, vi } from "vitest";
import { UpdateReceptivenessUseCase } from "../update-receptiveness";
import { ReceptivenessScore } from "@/domain/value-objects/receptiveness-score";
import type { ReceptivenessRepository } from "@/domain/interfaces/receptiveness-repository";

function mockRepo(existing: ReceptivenessScore | null = null): ReceptivenessRepository {
  return {
    findByUserId: vi.fn().mockResolvedValue(existing),
    save: vi.fn(),
    countAllUsers: vi.fn().mockResolvedValue(100),
    countUsersWithScoreBelow: vi.fn().mockResolvedValue(80),
  };
}

describe("UpdateReceptivenessUseCase", () => {
  it("creates initial score when none exists and adds template adoption", async () => {
    const repo = mockRepo(null);
    const uc = new UpdateReceptivenessUseCase({ receptivenessRepository: repo });
    const result = await uc.addTemplateAdoption("user-1");
    expect(result.totalPoints).toBe(5);
    expect(result.templateAdoptions).toBe(1);
    expect(repo.save).toHaveBeenCalledOnce();
  });

  it("adds feel heard bonus to existing score", async () => {
    const existing = ReceptivenessScore.reconstitute({
      userId: "user-1",
      totalPoints: 10,
      templateAdoptions: 2,
      feelHeardReceived: 0,
      percentile: null,
    });
    const repo = mockRepo(existing);
    const uc = new UpdateReceptivenessUseCase({ receptivenessRepository: repo });
    const result = await uc.addFeelHeardBonus("user-1", 4);
    expect(result.totalPoints).toBe(20);
    expect(result.feelHeardReceived).toBe(1);
  });

  it("calculates percentile correctly", async () => {
    const existing = ReceptivenessScore.reconstitute({
      userId: "user-1",
      totalPoints: 50,
      templateAdoptions: 5,
      feelHeardReceived: 2,
      percentile: null,
    });
    const repo = mockRepo(existing);
    const uc = new UpdateReceptivenessUseCase({ receptivenessRepository: repo });
    const result = await uc.getWithPercentile("user-1");
    // 80 out of 100 users have lower score → top 20%
    expect(result.percentile).toBe(20);
  });

  it("does not add bonus for feel heard score < 4", async () => {
    const existing = ReceptivenessScore.initial("user-1");
    const repo = mockRepo(existing);
    const uc = new UpdateReceptivenessUseCase({ receptivenessRepository: repo });
    const result = await uc.addFeelHeardBonus("user-1", 2);
    expect(result.totalPoints).toBe(0);
    expect(result.feelHeardReceived).toBe(0);
  });
});
