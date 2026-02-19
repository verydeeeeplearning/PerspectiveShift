import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { LightProtocolRepository } from "@/domain/interfaces/light-protocol-repository";
import type { LightProtocolType } from "@/domain/value-objects/light-protocol-type";
import { LightProtocolSession } from "@/domain/entities/light-protocol-session";
import type { LightProtocolOutput } from "../dtos/light-protocol-output";

export interface StartLightProtocolDeps {
  friendshipRepository: FriendshipRepository;
  lightProtocolRepository: LightProtocolRepository;
}

export class StartLightProtocolUseCase {
  constructor(private readonly deps: StartLightProtocolDeps) {}

  async execute(
    friendshipId: string,
    initiatorId: string,
    type: LightProtocolType,
  ): Promise<LightProtocolOutput> {
    const friendship =
      await this.deps.friendshipRepository.findById(friendshipId);
    if (!friendship) {
      throw new Error(`Friendship ${friendshipId} not found`);
    }
    if (!friendship.isMember(initiatorId)) {
      throw new Error("User is not a member of this friendship");
    }
    if (!friendship.isActive()) {
      throw new Error("Friendship is not active");
    }

    const existing =
      await this.deps.lightProtocolRepository.findActiveByFriendship(
        friendshipId,
      );
    if (existing) {
      throw new Error("An active light protocol session already exists");
    }

    const session = LightProtocolSession.create({
      id: crypto.randomUUID(),
      friendshipId,
      type,
      initiatorId,
      createdAt: new Date(),
    });

    await this.deps.lightProtocolRepository.save(session);

    return {
      id: session.id,
      friendshipId: session.friendshipId,
      type: session.type,
      initiatorId: session.initiatorId,
      status: session.status,
      initiatorResponse: session.initiatorResponse,
      responderResponse: session.responderResponse,
      createdAt: session.createdAt.toISOString(),
      completedAt: null,
    };
  }
}
