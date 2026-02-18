import { describe, it, expect, vi } from "vitest";
import { RespondToFriendRequestUseCase } from "../respond-to-friend-request";
import { FriendRequest } from "@/domain/entities/friend-request";
import {
  FriendRequestNotFoundError,
  UnauthorizedParticipantError,
  FriendRequestAlreadyResolvedError,
} from "@/domain/errors/domain-errors";
import type { FriendRepository } from "@/domain/interfaces/friend-repository";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";

function makeRequest(status: "PENDING" | "ACCEPTED" = "PENDING") {
  return FriendRequest.create({
    id: "req-1",
    requesterId: "user-a",
    targetId: "user-b",
    dialogueSessionId: null,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function setup(request: FriendRequest | null = makeRequest()) {
  const friendRepo: FriendRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(request),
    findPending: vi.fn(),
    findPendingForUser: vi.fn(),
    update: vi.fn(),
  };

  const friendshipRepo: FriendshipRepository = {
    findById: vi.fn(),
    findByUsers: vi.fn(),
    findByUser: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  };

  const uc = new RespondToFriendRequestUseCase({
    friendRepository: friendRepo,
    friendshipRepository: friendshipRepo,
  });

  return { uc, friendRepo, friendshipRepo };
}

describe("RespondToFriendRequestUseCase", () => {
  it("accept creates friendship", async () => {
    const { uc, friendshipRepo } = setup();
    const result = await uc.execute("req-1", "user-b", "accept");

    expect(result.status).toBe("ACCEPTED");
    expect(result.friendshipId).toBeTruthy();
    expect(friendshipRepo.save).toHaveBeenCalledOnce();
  });

  it("decline does not create friendship", async () => {
    const { uc, friendshipRepo } = setup();
    const result = await uc.execute("req-1", "user-b", "decline");

    expect(result.status).toBe("DECLINED");
    expect(result.friendshipId).toBeNull();
    expect(friendshipRepo.save).not.toHaveBeenCalled();
  });

  it("silent_reject does not create friendship", async () => {
    const { uc, friendshipRepo } = setup();
    const result = await uc.execute(
      "req-1",
      "user-b",
      "silent_reject",
    );

    expect(result.status).toBe("SILENT_REJECTED");
    expect(result.friendshipId).toBeNull();
    expect(friendshipRepo.save).not.toHaveBeenCalled();
  });

  it("throws FriendRequestNotFoundError when not found", async () => {
    const { uc } = setup(null);
    await expect(
      uc.execute("req-1", "user-b", "accept"),
    ).rejects.toThrow(FriendRequestNotFoundError);
  });

  it("throws UnauthorizedParticipantError if not target", async () => {
    const { uc } = setup();
    await expect(
      uc.execute("req-1", "user-c", "accept"),
    ).rejects.toThrow(UnauthorizedParticipantError);
  });

  it("throws FriendRequestAlreadyResolvedError for resolved request", async () => {
    const accepted = makeRequest("ACCEPTED");
    const { uc } = setup(accepted);
    await expect(
      uc.execute("req-1", "user-b", "accept"),
    ).rejects.toThrow(FriendRequestAlreadyResolvedError);
  });

  it("normalizes user pair in friendship (userA < userB)", async () => {
    const { uc, friendshipRepo } = setup();
    await uc.execute("req-1", "user-b", "accept");

    const saved = (friendshipRepo.save as ReturnType<typeof vi.fn>)
      .mock.calls[0][0];
    expect(saved.userA < saved.userB).toBe(true);
  });
});
