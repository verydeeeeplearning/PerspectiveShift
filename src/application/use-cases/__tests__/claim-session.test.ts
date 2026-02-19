import { describe, it, expect, vi } from "vitest";
import { ClaimSessionUseCase } from "../claim-session";
import { UserProfile } from "@/domain/entities/user-profile";
import {
  SessionAlreadyClaimedError,
} from "@/domain/errors/domain-errors";
import type { UserRepository } from "@/domain/interfaces/user-repository";

function makeUserRepo(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findBySessionId: vi.fn().mockResolvedValue(null),
    save: vi.fn(),
    update: vi.fn(),
    ...overrides,
  };
}

function makeProfile(userId: string, sessions: string[] = []) {
  return UserProfile.create({
    userId,
    displayAlias: `참여자_${userId.slice(0, 4).toUpperCase()}`,
    claimedSessionIds: sessions,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("ClaimSessionUseCase", () => {
  it("creates a new user profile if none exists", async () => {
    const repo = makeUserRepo();
    const uc = new ClaimSessionUseCase({ userRepository: repo });
    const result = await uc.execute("user-1", "session-a");

    expect(result.userId).toBe("user-1");
    expect(result.sessionId).toBe("session-a");
    expect(result.alreadyClaimed).toBe(false);
    expect(repo.save).toHaveBeenCalledOnce();
    expect(repo.update).toHaveBeenCalledOnce();
  });

  it("claims session for existing user", async () => {
    const profile = makeProfile("user-1");
    const repo = makeUserRepo({
      findById: vi.fn().mockResolvedValue(profile),
    });
    const uc = new ClaimSessionUseCase({ userRepository: repo });
    const result = await uc.execute("user-1", "session-a");

    expect(result.alreadyClaimed).toBe(false);
    expect(repo.save).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledOnce();
  });

  it("returns alreadyClaimed=true when session already claimed by same user", async () => {
    const profile = makeProfile("user-1", ["session-a"]);
    const repo = makeUserRepo({
      findById: vi.fn().mockResolvedValue(profile),
    });
    const uc = new ClaimSessionUseCase({ userRepository: repo });
    const result = await uc.execute("user-1", "session-a");

    expect(result.alreadyClaimed).toBe(true);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("throws SessionAlreadyClaimedError when session owned by another user", async () => {
    const otherProfile = makeProfile("other-user", ["session-a"]);
    const repo = makeUserRepo({
      findBySessionId: vi.fn().mockResolvedValue(otherProfile),
    });
    const uc = new ClaimSessionUseCase({ userRepository: repo });

    await expect(uc.execute("user-1", "session-a")).rejects.toThrow(
      SessionAlreadyClaimedError,
    );
  });

  it("does not throw when session claimed by same user via findBySessionId", async () => {
    const profile = makeProfile("user-1", ["session-a"]);
    const repo = makeUserRepo({
      findBySessionId: vi.fn().mockResolvedValue(profile),
      findById: vi.fn().mockResolvedValue(profile),
    });
    const uc = new ClaimSessionUseCase({ userRepository: repo });
    const result = await uc.execute("user-1", "session-a");

    expect(result.alreadyClaimed).toBe(true);
  });

  it("generates display alias from userId prefix", async () => {
    const repo = makeUserRepo();
    const uc = new ClaimSessionUseCase({ userRepository: repo });
    await uc.execute("abcd-1234", "session-a");

    const savedProfile = (repo.save as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as UserProfile;
    expect(savedProfile.displayAlias).toBe("참여자_ABCD");
  });
});
