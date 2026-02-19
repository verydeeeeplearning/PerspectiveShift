import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { LightProtocolRepository } from "@/domain/interfaces/light-protocol-repository";
import type { ProtocolResponseData } from "@/domain/entities/light-protocol-session";
import type { LightProtocolOutput } from "../dtos/light-protocol-output";

export interface SubmitLightProtocolDeps {
  friendshipRepository: FriendshipRepository;
  lightProtocolRepository: LightProtocolRepository;
}

export class SubmitLightProtocolUseCase {
  constructor(private readonly deps: SubmitLightProtocolDeps) {}

  async execute(
    sessionId: string,
    userId: string,
    response: ProtocolResponseData,
  ): Promise<LightProtocolOutput> {
    const session =
      await this.deps.lightProtocolRepository.findById(sessionId);
    if (!session) {
      throw new Error(`Light protocol session ${sessionId} not found`);
    }

    if (session.isExpired()) {
      session.expire();
      await this.deps.lightProtocolRepository.update(session);
      throw new Error("Session has expired");
    }

    const isInitiator = userId === session.initiatorId;
    if (isInitiator) {
      session.submitInitiatorResponse(response);
    } else {
      session.submitResponderResponse(response);
    }

    await this.deps.lightProtocolRepository.update(session);

    if (session.isCompleted()) {
      const friendship =
        await this.deps.friendshipRepository.findById(session.friendshipId);
      if (friendship) {
        friendship.incrementLightProtocolCount();
        await this.deps.friendshipRepository.update(friendship);
      }
    }

    return {
      id: session.id,
      friendshipId: session.friendshipId,
      type: session.type,
      initiatorId: session.initiatorId,
      status: session.status,
      initiatorResponse: session.initiatorResponse,
      responderResponse: session.responderResponse,
      createdAt: session.createdAt.toISOString(),
      completedAt: session.completedAt?.toISOString() ?? null,
    };
  }
}
