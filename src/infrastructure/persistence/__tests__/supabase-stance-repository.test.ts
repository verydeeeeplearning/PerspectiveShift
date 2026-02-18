import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseStanceRepository } from "../supabase-stance-repository";
import { StanceVector } from "@/domain/entities/stance-vector";
import type { StanceProfile } from "@/domain/interfaces/stance-repository";

function createMockClient() {
  const mockChain = {
    insert: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: {
        id: "uuid-1",
        session_id: "sess-1",
        tech_reg: 0.5,
        redistrib: 0.3,
        work_life: 0.1,
        meritocracy: -0.2,
        tech_optim: 0.4,
        opp_equality: 0.2,
        map_type: "BALANCE_SEEKER",
        reasoning: null,
        readiness: 0.5,
        precision: "initial",
        created_at: "2026-02-18T00:00:00Z",
        updated_at: "2026-02-18T00:00:00Z",
      },
      error: null,
    }),
    update: vi.fn().mockReturnThis(),
  };

  return {
    from: vi.fn(() => mockChain),
    _mockChain: mockChain,
  };
}

function createSampleProfile(): StanceProfile {
  return {
    id: "uuid-1",
    sessionId: "sess-1",
    vector: StanceVector.fromValues({
      TECH_REGULATION: 0.5,
      REDISTRIBUTION: 0.3,
      WORK_LIFE: 0.1,
      MERITOCRACY: -0.2,
      TECH_OPTIMISM: 0.4,
      OPPORTUNITY_EQUALITY: 0.2,
    }),
    mapType: "BALANCE_SEEKER",
    reasoning: null,
    readiness: 0.5,
    precision: "initial",
    createdAt: new Date("2026-02-18"),
    updatedAt: new Date("2026-02-18"),
  };
}

describe("SupabaseStanceRepository", () => {
  let mockClient: ReturnType<typeof createMockClient>;
  let repo: SupabaseStanceRepository;

  beforeEach(() => {
    mockClient = createMockClient();
    repo = new SupabaseStanceRepository(mockClient as never);
  });

  describe("save", () => {
    it("inserts stance profile row", async () => {
      const profile = createSampleProfile();
      await repo.save(profile);

      expect(mockClient.from).toHaveBeenCalledWith("stance_profiles");
      expect(mockClient._mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "uuid-1",
          session_id: "sess-1",
          tech_reg: 0.5,
          redistrib: 0.3,
          map_type: "BALANCE_SEEKER",
        }),
      );
    });

    it("throws on insert error", async () => {
      mockClient._mockChain.insert.mockResolvedValueOnce({
        error: { message: "duplicate key" },
      });

      await expect(repo.save(createSampleProfile())).rejects.toThrow(
        "Failed to save stance profile",
      );
    });
  });

  describe("findBySessionId", () => {
    it("returns profile when found", async () => {
      const profile = await repo.findBySessionId("sess-1");

      expect(profile).not.toBeNull();
      expect(profile!.sessionId).toBe("sess-1");
      expect(profile!.vector.get("TECH_REGULATION").value).toBe(0.5);
    });

    it("returns null when not found", async () => {
      mockClient._mockChain.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      });

      const result = await repo.findBySessionId("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("updates specified fields", async () => {
      mockClient._mockChain.eq.mockResolvedValueOnce({ error: null });

      await repo.update("sess-1", {
        mapType: "LIBERTY_INNOVATOR",
        readiness: 0.9,
      });

      expect(mockClient._mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          map_type: "LIBERTY_INNOVATOR",
          readiness: 0.9,
        }),
      );
    });
  });
});
