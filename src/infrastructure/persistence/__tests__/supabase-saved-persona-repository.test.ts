import { describe, it, expect, vi } from "vitest";
import { SupabaseSavedPersonaRepository } from "../supabase-saved-persona-repository";
import { SavedPersona } from "@/domain/entities/saved-persona";

function makePersona() {
  return SavedPersona.create({
    userId: "u-1",
    personaId: "p-1",
    conversationCount: 2,
    lastConversationAt: new Date("2026-01-15T00:00:00Z"),
    conversationSummaries: ["summary1"],
    sharedContext: ["ctx"],
    userStanceMemory: ["mem"],
    savedQuestions: ["q1"],
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
          eq: vi.fn().mockReturnValue({ single }),
          order: orderFn,
        }),
      }),
    }),
  } as unknown as ConstructorParameters<typeof SupabaseSavedPersonaRepository>[0];
}

const ROW = {
  user_id: "u-1",
  persona_id: "p-1",
  conversation_count: 2,
  last_conversation_at: "2026-01-15T00:00:00Z",
  conversation_summaries: ["summary1"],
  shared_context: ["ctx"],
  user_stance_memory: ["mem"],
  saved_questions: ["q1"],
};

describe("SupabaseSavedPersonaRepository", () => {
  it("saves a persona without error", async () => {
    const supabase = mockSupabase();
    const repo = new SupabaseSavedPersonaRepository(supabase as never);
    await expect(repo.save(makePersona())).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith("saved_personas");
  });

  it("throws when save fails", async () => {
    const supabase = mockSupabase({ upsertError: new Error("DB error") });
    const repo = new SupabaseSavedPersonaRepository(supabase as never);
    await expect(repo.save(makePersona())).rejects.toThrow("DB error");
  });

  it("findByUserAndPersona returns null when not found", async () => {
    const supabase = mockSupabase({ selectData: null });
    const repo = new SupabaseSavedPersonaRepository(supabase as never);
    const result = await repo.findByUserAndPersona("u-1", "p-99");
    expect(result).toBeNull();
  });

  it("findByUserAndPersona returns entity when found", async () => {
    const supabase = mockSupabase({ selectData: ROW });
    const repo = new SupabaseSavedPersonaRepository(supabase as never);
    const result = await repo.findByUserAndPersona("u-1", "p-1");
    expect(result).not.toBeNull();
    expect(result!.userId).toBe("u-1");
    expect(result!.personaId).toBe("p-1");
    expect(result!.conversationCount).toBe(2);
  });

  it("findByUser returns sorted list", async () => {
    const supabase = mockSupabase({ selectArrayData: [ROW] });
    const repo = new SupabaseSavedPersonaRepository(supabase as never);
    const result = await repo.findByUser("u-1");
    expect(result).toHaveLength(1);
    expect(result[0].personaId).toBe("p-1");
  });
});
