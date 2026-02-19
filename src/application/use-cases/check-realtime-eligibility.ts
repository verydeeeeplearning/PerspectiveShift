import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { RealtimeEligibilityOutput } from "../dtos/light-protocol-output";

export interface CheckRealtimeEligibilityDeps {
  friendshipRepository: FriendshipRepository;
}

export class CheckRealtimeEligibilityUseCase {
  constructor(private readonly deps: CheckRealtimeEligibilityDeps) {}

  async execute(friendshipId: string): Promise<RealtimeEligibilityOutput> {
    const friendship =
      await this.deps.friendshipRepository.findById(friendshipId);
    if (!friendship) {
      throw new Error(`Friendship ${friendshipId} not found`);
    }

    if (!friendship.isActive()) {
      return { eligible: false, reason: "친구 관계가 활성 상태가 아닙니다" };
    }

    if (friendship.dialogueCount < 2) {
      return {
        eligible: false,
        reason: `구조화된 대화를 ${2 - friendship.dialogueCount}회 더 완료해야 합니다`,
      };
    }

    if (friendship.completedLightProtocols < 1) {
      return {
        eligible: false,
        reason: "라이트 프로토콜을 1회 이상 완료해야 합니다",
      };
    }

    return { eligible: true };
  }
}
