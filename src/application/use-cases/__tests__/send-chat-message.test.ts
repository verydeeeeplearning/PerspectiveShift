import { describe, it, expect, vi } from "vitest";
import { SendChatMessageUseCase } from "../send-chat-message";
import { Friendship } from "@/domain/entities/friendship";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { BlockRepository } from "@/domain/interfaces/block-repository";
import type { MessageRepository } from "@/domain/interfaces/message-repository";
import type { RealtimeBroadcaster } from "@/domain/interfaces/realtime-broadcaster";
import type { RateLimiter } from "@/domain/interfaces/rate-limiter";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import {
  FriendshipNotFoundError,
  FriendshipNotActiveError,
  UnauthorizedParticipantError,
  UserBlockedError,
  RateLimitExceededError,
} from "@/domain/errors/domain-errors";

function makeFriendship(
  overrides: {
    status?: "ACTIVE" | "BLOCKED" | "UNMATCHED";
    userA?: string;
    userB?: string;
  } = {},
) {
  return Friendship.create({
    id: "friendship-1",
    userA: overrides.userA ?? "user-a",
    userB: overrides.userB ?? "user-b",
    status: overrides.status ?? "ACTIVE",
    dialogueCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("SendChatMessageUseCase", () => {
  function setup(
    friendship: Friendship | null = makeFriendship(),
    options: {
      blocked?: boolean;
      rateLimited?: boolean;
      piiDetected?: boolean;
    } = {},
  ) {
    const friendshipRepo: FriendshipRepository = {
      findById: vi.fn().mockResolvedValue(friendship),
      findByUsers: vi.fn(),
      findByUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };
    const blockRepo: BlockRepository = {
      isBlocked: vi.fn(),
      isBlockedEitherDirection: vi
        .fn()
        .mockResolvedValue(options.blocked ?? false),
      block: vi.fn(),
      unblock: vi.fn(),
    };
    const messageRepo: MessageRepository = {
      save: vi.fn(),
      findByFriendship: vi.fn(),
      findById: vi.fn(),
    };
    const broadcaster: RealtimeBroadcaster = {
      broadcast: vi.fn(),
    };
    const rateLimiter: RateLimiter = {
      isAllowed: vi.fn().mockReturnValue(!(options.rateLimited ?? false)),
      consume: vi.fn(),
    };
    const piiScrubber: PiiScrubber = {
      scrub: vi.fn().mockReturnValue(
        options.piiDetected
          ? {
              scrubbed: "Hi [REDACTED]!",
              piiDetected: true,
              detectedTypes: ["PHONE"],
            }
          : {
              scrubbed: "Hello!",
              piiDetected: false,
              detectedTypes: [],
            },
      ),
    };

    const uc = new SendChatMessageUseCase({
      friendshipRepository: friendshipRepo,
      blockRepository: blockRepo,
      messageRepository: messageRepo,
      realtimeBroadcaster: broadcaster,
      rateLimiter,
      piiScrubber,
    });

    return {
      uc,
      friendshipRepo,
      blockRepo,
      messageRepo,
      broadcaster,
      rateLimiter,
      piiScrubber,
    };
  }

  it("sends a message successfully", async () => {
    const { uc, messageRepo, broadcaster } = setup();
    const result = await uc.execute("friendship-1", "user-a", "Hello!");

    expect(result.friendshipId).toBe("friendship-1");
    expect(result.senderId).toBe("user-a");
    expect(result.content).toBe("Hello!");
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
    expect(messageRepo.save).toHaveBeenCalledOnce();
    expect(broadcaster.broadcast).toHaveBeenCalledOnce();
  });

  it("broadcasts to correct channel with message payload", async () => {
    const { uc, broadcaster } = setup();
    await uc.execute("friendship-1", "user-a", "Hello!");

    expect(broadcaster.broadcast).toHaveBeenCalledWith(
      "chat:friendship-1",
      "new_message",
      expect.objectContaining({
        friendshipId: "friendship-1",
        senderId: "user-a",
        content: "Hello!",
      }),
    );
  });

  it("throws FriendshipNotFoundError when friendship does not exist", async () => {
    const { uc } = setup(null);
    await expect(
      uc.execute("friendship-1", "user-a", "Hello!"),
    ).rejects.toThrow(FriendshipNotFoundError);
  });

  it("throws FriendshipNotActiveError when friendship is not active", async () => {
    const { uc } = setup(makeFriendship({ status: "BLOCKED" }));
    await expect(
      uc.execute("friendship-1", "user-a", "Hello!"),
    ).rejects.toThrow(FriendshipNotActiveError);
  });

  it("throws UnauthorizedParticipantError when sender is not a member", async () => {
    const { uc } = setup();
    await expect(
      uc.execute("friendship-1", "stranger", "Hello!"),
    ).rejects.toThrow(UnauthorizedParticipantError);
  });

  it("throws UserBlockedError when block exists", async () => {
    const { uc } = setup(makeFriendship(), { blocked: true });
    await expect(
      uc.execute("friendship-1", "user-a", "Hello!"),
    ).rejects.toThrow(UserBlockedError);
  });

  it("throws RateLimitExceededError when rate limited", async () => {
    const { uc } = setup(makeFriendship(), { rateLimited: true });
    await expect(
      uc.execute("friendship-1", "user-a", "Hello!"),
    ).rejects.toThrow(RateLimitExceededError);
  });

  it("scrubs PII from content before saving", async () => {
    const { uc, messageRepo } = setup(makeFriendship(), {
      piiDetected: true,
    });
    const result = await uc.execute(
      "friendship-1",
      "user-a",
      "Hi 010-1234-5678!",
    );

    expect(result.content).toBe("Hi [REDACTED]!");
    expect(messageRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "Hi [REDACTED]!",
        piiScrubbed: true,
      }),
    );
  });

  it("consumes rate limit token on successful send", async () => {
    const { uc, rateLimiter } = setup();
    await uc.execute("friendship-1", "user-a", "Hello!");

    expect(rateLimiter.consume).toHaveBeenCalledWith("user-a");
  });

  it("does not consume rate limit when rate limited", async () => {
    const { uc, rateLimiter } = setup(makeFriendship(), {
      rateLimited: true,
    });

    await expect(
      uc.execute("friendship-1", "user-a", "Hello!"),
    ).rejects.toThrow(RateLimitExceededError);
    expect(rateLimiter.consume).not.toHaveBeenCalled();
  });
});
