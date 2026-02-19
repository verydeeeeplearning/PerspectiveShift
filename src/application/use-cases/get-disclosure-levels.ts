import type { DisclosureRepository } from "@/domain/interfaces/disclosure-repository";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { DisclosurePairOutput, DisclosureSettingOutput } from "../dtos/disclosure-output";
import {
  FriendshipNotFoundError,
  UnauthorizedParticipantError,
} from "@/domain/errors/domain-errors";
import { DisclosureSetting } from "@/domain/entities/disclosure-setting";
import { DisclosureLevel } from "@/domain/value-objects/disclosure-level";

export interface GetDisclosureLevelsDeps {
  disclosureRepository: DisclosureRepository;
  friendshipRepository: FriendshipRepository;
}

export class GetDisclosureLevelsUseCase {
  private deps: GetDisclosureLevelsDeps;

  constructor(deps: GetDisclosureLevelsDeps) {
    this.deps = deps;
  }

  async execute(
    userId: string,
    friendshipId: string,
  ): Promise<DisclosurePairOutput> {
    const friendship =
      await this.deps.friendshipRepository.findById(friendshipId);
    if (!friendship) {
      throw new FriendshipNotFoundError(friendshipId);
    }

    if (!friendship.isMember(userId)) {
      throw new UnauthorizedParticipantError(userId);
    }

    const otherUserId =
      friendship.userA === userId ? friendship.userB : friendship.userA;

    const myDisclosureSetting =
      await this.deps.disclosureRepository.findByDirection(
        friendshipId,
        userId,
        otherUserId,
      );

    const theirDisclosureSetting =
      await this.deps.disclosureRepository.findByDirection(
        friendshipId,
        otherUserId,
        userId,
      );

    return {
      myDisclosure: this.toOutput(
        myDisclosureSetting,
        friendshipId,
        userId,
        otherUserId,
      ),
      theirDisclosure: this.toOutput(
        theirDisclosureSetting,
        friendshipId,
        otherUserId,
        userId,
      ),
    };
  }

  private toOutput(
    setting: DisclosureSetting | null,
    friendshipId: string,
    fromUserId: string,
    toUserId: string,
  ): DisclosureSettingOutput {
    if (setting) {
      return {
        friendshipId: setting.friendshipId,
        fromUserId: setting.fromUserId,
        toUserId: setting.toUserId,
        level: setting.level.value,
        levelLabel: setting.level.label,
      };
    }

    const defaultLevel = DisclosureLevel.create(0);
    return {
      friendshipId,
      fromUserId,
      toUserId,
      level: defaultLevel.value,
      levelLabel: defaultLevel.label,
    };
  }
}
