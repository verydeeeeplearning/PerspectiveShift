import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseUserRepository } from "../supabase-user-repository";
import { UserProfile } from "@/domain/entities/user-profile";

function mockSupabase() {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  return {
    from: vi.fn().mockReturnValue(chainable),
    _chain: chainable,
  };
}

describe("SupabaseUserRepository", () => {
  let client: ReturnType<typeof mockSupabase>;
  let repo: SupabaseUserRepository;

  beforeEach(() => {
    client = mockSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    repo = new SupabaseUserRepository(client as any);
  });

  describe("findById", () => {
    it("returns null when user not found", async () => {
      const result = await repo.findById("user-1");
      expect(result).toBeNull();
    });

    it("returns UserProfile when found", async () => {
      client._chain.maybeSingle.mockResolvedValue({
        data: {
          user_id: "user-1",
          display_alias: "참여자_USER",
          claimed_session_ids: ["s1"],
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        error: null,
      });

      const result = await repo.findById("user-1");
      expect(result).toBeInstanceOf(UserProfile);
      expect(result!.userId).toBe("user-1");
      expect(result!.claimedSessionIds).toEqual(["s1"]);
    });

    it("throws on Supabase error", async () => {
      client._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });

      await expect(repo.findById("user-1")).rejects.toThrow("Failed to find user");
    });
  });

  describe("save", () => {
    it("inserts a profile row", async () => {
      client._chain.insert.mockResolvedValue({ error: null });

      const profile = UserProfile.create({
        userId: "user-1",
        displayAlias: "참여자_USER",
        claimedSessionIds: [],
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      });

      await expect(repo.save(profile)).resolves.not.toThrow();
      expect(client.from).toHaveBeenCalledWith("user_profiles");
    });
  });

  describe("update", () => {
    it("updates a profile row", async () => {
      client._chain.eq.mockResolvedValue({ error: null });

      const profile = UserProfile.create({
        userId: "user-1",
        displayAlias: "참여자_USER",
        claimedSessionIds: ["s1"],
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      });

      await expect(repo.update(profile)).resolves.not.toThrow();
    });
  });
});
