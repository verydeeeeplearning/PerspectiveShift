import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseLightProtocolRepository } from "../supabase-light-protocol-repository";
import { LightProtocolSession } from "@/domain/entities/light-protocol-session";

function makeSession() {
  return LightProtocolSession.create({
    id: "lp-1",
    friendshipId: "f-1",
    type: "COMMON_GROUND",
    initiatorId: "alice",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  });
}

function mockSupabase(overrides: {
  insertError?: Error | null;
  selectData?: Record<string, unknown> | null;
  selectArrayData?: Record<string, unknown>[];
  updateError?: Error | null;
} = {}) {
  const single = vi.fn().mockResolvedValue({
    data: overrides.selectData ?? null,
    error: null,
  });
  const eqChain = { eq: vi.fn().mockReturnValue({ single }), single };
  const orderFn = vi.fn().mockResolvedValue({
    data: overrides.selectArrayData ?? [],
    error: null,
  });
  return {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: overrides.insertError ?? null }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single,
          eq: vi.fn().mockReturnValue({ single }),
          order: orderFn,
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: overrides.updateError ?? null }),
      }),
    }),
  };
}

describe("SupabaseLightProtocolRepository", () => {
  it("saves a session without error", async () => {
    const supabase = mockSupabase();
    const repo = new SupabaseLightProtocolRepository(supabase as never);
    const session = makeSession();

    await expect(repo.save(session)).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith("light_protocol_sessions");
  });

  it("throws when save fails", async () => {
    const supabase = mockSupabase({ insertError: new Error("DB error") });
    const repo = new SupabaseLightProtocolRepository(supabase as never);

    await expect(repo.save(makeSession())).rejects.toThrow("DB error");
  });

  it("findById returns null when not found", async () => {
    const supabase = mockSupabase({ selectData: null });
    const repo = new SupabaseLightProtocolRepository(supabase as never);

    const result = await repo.findById("lp-99");
    expect(result).toBeNull();
  });

  it("findById returns session when found", async () => {
    const supabase = mockSupabase({
      selectData: {
        id: "lp-1",
        friendship_id: "f-1",
        type: "COMMON_GROUND",
        initiator_id: "alice",
        status: "ACTIVE",
        initiator_response: null,
        responder_response: null,
        created_at: "2026-01-01T00:00:00Z",
        completed_at: null,
      },
    });
    const repo = new SupabaseLightProtocolRepository(supabase as never);

    const result = await repo.findById("lp-1");
    expect(result).not.toBeNull();
    expect(result!.id).toBe("lp-1");
    expect(result!.type).toBe("COMMON_GROUND");
  });

  it("update does not throw on success", async () => {
    const supabase = mockSupabase();
    const repo = new SupabaseLightProtocolRepository(supabase as never);

    await expect(repo.update(makeSession())).resolves.toBeUndefined();
  });
});
