import { describe, it, expect, vi } from "vitest";
import { RequestFriendshipUseCase } from "../request-friendship";
import { DialogueSession } from "@/domain/entities/dialogue-session";
import {
  CannotFriendSelfError,
  UserBlockedError,
  FriendRequestAlreadyExistsError,
  InsufficientDialogueHistoryError,
} from "@/domain/errors/domain-errors";
import type { FriendRepository } from "@/domain/interfaces/friend-repository";
import type { BlockRepository } from "@/domain/interfaces/block-repository";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";

function makeCompletedSession(participantA: string, participantB: string) {
  return DialogueSession.create({
    id: "session-1",
    participantA,
    participantB,
    currentStep: "REFLECTION",
    status: "COMPLETED",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivityAt: new Date(),
  });
}

function setup(overrides: {
  blocked?: boolean;
  hasPending?: boolean;
  sessions?: DialogueSession[];
} = {}) {
  const friendRepo: FriendRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findPending: vi.fn().mockResolvedValue(
      overrides.hasPending ? { id: "existing" } : null,
    ),
    findPendingForUser: vi.fn(),
    update: vi.fn(),
  };

  const blockRepo: BlockRepository = {
    isBlocked: vi.fn(),
    isBlockedEitherDirection: vi
      .fn()
      .mockResolvedValue(overrides.blocked ?? false),
    block: vi.fn(),
    unblock: vi.fn(),
  };

  const dialogueRepo: DialogueRepository = {
    saveSession: vi.fn(),
    findSessionById: vi.fn(),
    findSessionsByParticipant: vi
      .fn()
      .mockResolvedValue(overrides.sessions ?? []),
    saveTurn: vi.fn(),
    updateSession: vi.fn(),
    findActiveSessions: vi.fn(),
  };

  const uc = new RequestFriendshipUseCase({
    friendRepository: friendRepo,
    blockRepository: blockRepo,
    dialogueRepository: dialogueRepo,
  });

  return { uc, friendRepo, blockRepo, dialogueRepo };
}

describe("RequestFriendshipUseCase", () => {
  it("creates friend request when conditions met", async () => {
    const session = makeCompletedSession("user-a", "user-b");
    const { uc, friendRepo } = setup({ sessions: [session] });
    const result = await uc.execute("user-a", "user-b");

    expect(result.status).toBe("PENDING");
    expect(result.requesterId).toBe("user-a");
    expect(result.targetId).toBe("user-b");
    expect(friendRepo.save).toHaveBeenCalledOnce();
  });

  it("throws CannotFriendSelfError for self-request", async () => {
    const { uc } = setup();
    await expect(uc.execute("user-a", "user-a")).rejects.toThrow(
      CannotFriendSelfError,
    );
  });

  it("throws UserBlockedError when blocked", async () => {
    const { uc } = setup({ blocked: true });
    await expect(uc.execute("user-a", "user-b")).rejects.toThrow(
      UserBlockedError,
    );
  });

  it("throws FriendRequestAlreadyExistsError when pending exists", async () => {
    const session = makeCompletedSession("user-a", "user-b");
    const { uc } = setup({ hasPending: true, sessions: [session] });
    await expect(uc.execute("user-a", "user-b")).rejects.toThrow(
      FriendRequestAlreadyExistsError,
    );
  });

  it("throws InsufficientDialogueHistoryError when no completed dialogue", async () => {
    const { uc } = setup({ sessions: [] });
    await expect(uc.execute("user-a", "user-b")).rejects.toThrow(
      InsufficientDialogueHistoryError,
    );
  });

  it("passes dialogue session id to request", async () => {
    const session = makeCompletedSession("user-a", "user-b");
    const { uc, friendRepo } = setup({ sessions: [session] });
    await uc.execute("user-a", "user-b", "session-1");

    const savedRequest = (friendRepo.save as ReturnType<typeof vi.fn>)
      .mock.calls[0][0];
    expect(savedRequest.dialogueSessionId).toBe("session-1");
  });
});
