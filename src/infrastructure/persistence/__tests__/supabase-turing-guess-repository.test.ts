import { describe, it, expect, vi } from "vitest";
import { SupabaseTuringGuessRepository } from "../supabase-turing-guess-repository";
import { TuringGuess } from "@/domain/entities/turing-guess";

function makeGuess() {
  return TuringGuess.create({
    id: "g-1",
    userId: "u-1",
    dialogueSessionId: "ds-1",
    guess: "human",
    actual: "ai",
    createdAt: new Date("2026-01-10T00:00:00Z"),
  });
}

function mockSupabase(overrides: {
  upsertError?: Error | null;
  selectData?: Record<string, unknown> | null;
  selectArrayData?: Record<string, unknown>[];
} = {}) {
  const single = vi.fn().mockResolvedValue({
    data: overrides.selectData ?? null,
    error: null,
  });
  const orderFn = vi.fn().mockResolvedValue({
    data: overrides.selectArrayData ?? [],
    error: null,
  });
  return {
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: overrides.upsertError ?? null }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: orderFn,
          eq: vi.fn().mockReturnValue({ single }),
        }),
      }),
    }),
  } as unknown as ConstructorParameters<typeof SupabaseTuringGuessRepository>[0];
}

const ROW = {
  id: "g-1",
  user_id: "u-1",
  dialogue_session_id: "ds-1",
  guess: "human",
  actual: "ai",
  created_at: "2026-01-10T00:00:00Z",
};

describe("SupabaseTuringGuessRepository", () => {
  it("saves a guess without error", async () => {
    const supabase = mockSupabase();
    const repo = new SupabaseTuringGuessRepository(supabase as never);
    await expect(repo.save(makeGuess())).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith("turing_guesses");
  });

  it("throws when save fails", async () => {
    const supabase = mockSupabase({ upsertError: new Error("DB error") });
    const repo = new SupabaseTuringGuessRepository(supabase as never);
    await expect(repo.save(makeGuess())).rejects.toThrow("DB error");
  });

  it("findByUser returns list", async () => {
    const supabase = mockSupabase({ selectArrayData: [ROW] });
    const repo = new SupabaseTuringGuessRepository(supabase as never);
    const result = await repo.findByUser("u-1");
    expect(result).toHaveLength(1);
    expect(result[0].isCorrect).toBe(false);
  });

  it("findByUserAndSession returns null when not found", async () => {
    const supabase = mockSupabase({ selectData: null });
    const repo = new SupabaseTuringGuessRepository(supabase as never);
    const result = await repo.findByUserAndSession("u-1", "ds-99");
    expect(result).toBeNull();
  });

  it("findByUserAndSession returns entity when found", async () => {
    const supabase = mockSupabase({ selectData: ROW });
    const repo = new SupabaseTuringGuessRepository(supabase as never);
    const result = await repo.findByUserAndSession("u-1", "ds-1");
    expect(result).not.toBeNull();
    expect(result!.guess).toBe("human");
    expect(result!.actual).toBe("ai");
  });
});
