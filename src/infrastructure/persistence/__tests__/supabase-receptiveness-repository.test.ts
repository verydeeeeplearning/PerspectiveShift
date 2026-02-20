import { describe, it, expect, vi } from "vitest";
import { SupabaseReceptivenessRepository } from "../supabase-receptiveness-repository";
import { ReceptivenessScore } from "@/domain/value-objects/receptiveness-score";

function makeScore() {
  return ReceptivenessScore.reconstitute({
    userId: "u-1",
    totalPoints: 30,
    templateAdoptions: 3,
    feelHeardReceived: 2,
    percentile: 75,
  });
}

function mockSupabase(overrides: {
  upsertError?: Error | null;
  selectData?: Record<string, unknown> | null;
  count?: number;
} = {}) {
  const single = vi.fn().mockResolvedValue({
    data: overrides.selectData ?? null,
    error: null,
  });
  const headResult = { count: overrides.count ?? 0, error: null };
  const ltFn = vi.fn().mockResolvedValue(headResult);
  // select() must be both thenable (for countAllUsers head:true) and chainable
  const selectResult = {
    eq: vi.fn().mockReturnValue({ single }),
    lt: ltFn,
    then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
      Promise.resolve(headResult).then(resolve, reject),
  };
  return {
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: overrides.upsertError ?? null }),
      select: vi.fn().mockReturnValue(selectResult),
    }),
  } as unknown as ConstructorParameters<typeof SupabaseReceptivenessRepository>[0];
}

const ROW = {
  user_id: "u-1",
  total_points: 30,
  template_adoptions: 3,
  feel_heard_received: 2,
  percentile: 75,
};

describe("SupabaseReceptivenessRepository", () => {
  it("saves a score without error", async () => {
    const supabase = mockSupabase();
    const repo = new SupabaseReceptivenessRepository(supabase as never);
    await expect(repo.save(makeScore())).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith("receptiveness_entries");
  });

  it("throws when save fails", async () => {
    const supabase = mockSupabase({ upsertError: new Error("DB error") });
    const repo = new SupabaseReceptivenessRepository(supabase as never);
    await expect(repo.save(makeScore())).rejects.toThrow("DB error");
  });

  it("findByUserId returns null when not found", async () => {
    const supabase = mockSupabase({ selectData: null });
    const repo = new SupabaseReceptivenessRepository(supabase as never);
    const result = await repo.findByUserId("u-99");
    expect(result).toBeNull();
  });

  it("findByUserId returns entity when found", async () => {
    const supabase = mockSupabase({ selectData: ROW });
    const repo = new SupabaseReceptivenessRepository(supabase as never);
    const result = await repo.findByUserId("u-1");
    expect(result).not.toBeNull();
    expect(result!.totalPoints).toBe(30);
    expect(result!.percentile).toBe(75);
  });

  it("countAllUsers returns count", async () => {
    const supabase = mockSupabase({ count: 42 });
    const repo = new SupabaseReceptivenessRepository(supabase as never);
    const result = await repo.countAllUsers();
    expect(result).toBe(42);
  });

  it("countUsersWithScoreBelow returns count", async () => {
    const supabase = mockSupabase({ count: 10 });
    const repo = new SupabaseReceptivenessRepository(supabase as never);
    const result = await repo.countUsersWithScoreBelow(50);
    expect(result).toBe(10);
  });
});
