import { describe, it, expect, vi } from "vitest";
import { SupabaseFollowUpRepository } from "../supabase-follow-up-repository";
import { FollowUpCheckin } from "@/domain/entities/follow-up-checkin";

function makeCheckin() {
  return FollowUpCheckin.create({
    id: "c-1",
    dialogueSessionId: "ds-1",
    participantId: "u-1",
    scheduledAt: new Date("2026-02-01T00:00:00Z"),
    avoidanceReduction: null,
    completedAt: null,
    createdAt: new Date("2026-01-20T00:00:00Z"),
  });
}

function mockSupabase(overrides: {
  upsertError?: Error | null;
  updateError?: Error | null;
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
  const isFn = vi.fn().mockReturnValue({ order: orderFn });
  return {
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: overrides.upsertError ?? null }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single,
          eq: vi.fn().mockReturnValue({ single }),
          is: isFn,
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: overrides.updateError ?? null }),
      }),
    }),
  } as unknown as ConstructorParameters<typeof SupabaseFollowUpRepository>[0];
}

const ROW = {
  id: "c-1",
  dialogue_session_id: "ds-1",
  participant_id: "u-1",
  scheduled_at: "2026-02-01T00:00:00Z",
  avoidance_reduction: null,
  completed_at: null,
  created_at: "2026-01-20T00:00:00Z",
};

describe("SupabaseFollowUpRepository", () => {
  it("saves a checkin without error", async () => {
    const supabase = mockSupabase();
    const repo = new SupabaseFollowUpRepository(supabase as never);
    await expect(repo.save(makeCheckin())).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith("follow_up_checkins");
  });

  it("throws when save fails", async () => {
    const supabase = mockSupabase({ upsertError: new Error("DB error") });
    const repo = new SupabaseFollowUpRepository(supabase as never);
    await expect(repo.save(makeCheckin())).rejects.toThrow("DB error");
  });

  it("findById returns null when not found", async () => {
    const supabase = mockSupabase({ selectData: null });
    const repo = new SupabaseFollowUpRepository(supabase as never);
    const result = await repo.findById("c-99");
    expect(result).toBeNull();
  });

  it("findById returns entity when found", async () => {
    const supabase = mockSupabase({ selectData: ROW });
    const repo = new SupabaseFollowUpRepository(supabase as never);
    const result = await repo.findById("c-1");
    expect(result).not.toBeNull();
    expect(result!.dialogueSessionId).toBe("ds-1");
  });

  it("findBySessionAndParticipant returns entity when found", async () => {
    const supabase = mockSupabase({ selectData: ROW });
    const repo = new SupabaseFollowUpRepository(supabase as never);
    const result = await repo.findBySessionAndParticipant("ds-1", "u-1");
    expect(result).not.toBeNull();
  });

  it("findPendingByParticipant returns list", async () => {
    const supabase = mockSupabase({ selectArrayData: [ROW] });
    const repo = new SupabaseFollowUpRepository(supabase as never);
    const result = await repo.findPendingByParticipant("u-1");
    expect(result).toHaveLength(1);
  });

  it("update does not throw on success", async () => {
    const supabase = mockSupabase();
    const repo = new SupabaseFollowUpRepository(supabase as never);
    await expect(repo.update(makeCheckin())).resolves.toBeUndefined();
  });

  it("update throws on error", async () => {
    const supabase = mockSupabase({ updateError: new Error("update fail") });
    const repo = new SupabaseFollowUpRepository(supabase as never);
    await expect(repo.update(makeCheckin())).rejects.toThrow("update fail");
  });
});
