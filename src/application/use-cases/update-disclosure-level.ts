import type { DisclosureRepository } from "@/domain/interfaces/disclosure-repository";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { EventTracker } from "@/domain/interfaces/event-tracker";
import type { DisclosureSettingOutput } from "../dtos/disclosure-output";
import { DisclosureSetting } from "@/domain/entities/disclosure-setting";
import { DisclosureLevel, DISCLOSURE_LEVEL_LABELS } from "@/domain/value-objects/disclosure-level";
import type { DisclosureLevelValue } from "@/domain/value-objects/disclosure-level";
import { RELATIONSHIP_EVENT_TYPES } from "@/domain/value-objects/relationship-event-type";
import {
  FriendshipNotFoundError,
  FriendshipNotActiveError,
  UnauthorizedParticipantError,
} from "@/domain/errors/domain-errors";

export interface UpdateDisclosureLevelDeps {
  disclosureRepository: DisclosureRepository;
  friendshipRepository: FriendshipRepository;
  eventTracker?: EventTracker;
}

export class UpdateDisclosureLevelUseCase {
  private deps: UpdateDisclosureLevelDeps;

  constructor(deps: UpdateDisclosureLevelDeps) {
    this.deps = deps;
  }

  async execute(
    userId: string,
    friendshipId: string,
    targetUserId: string,
    level: number,
  ): Promise<DisclosureSettingOutput> {
    const friendship =
      await this.deps.friendshipRepository.findById(friendshipId);
    if (!friendship) {
      throw new FriendshipNotFoundError(friendshipId);
    }

    if (!friendship.isActive()) {
      throw new FriendshipNotActiveError(friendshipId);
    }

    if (!friendship.isMember(userId)) {
      throw new UnauthorizedParticipantError(userId);
    }

    if (!friendship.isMember(targetUserId)) {
      throw new UnauthorizedParticipantError(targetUserId);
    }

    const newLevel = DisclosureLevel.create(level);

    const existing =
      await this.deps.disclosureRepository.findByDirection(
        friendshipId,
        userId,
        targetUserId,
      );

    if (existing) {
      existing.escalateTo(newLevel);
      await this.deps.disclosureRepository.update(existing);

      this.deps.eventTracker
        ?.track(RELATIONSHIP_EVENT_TYPES.DISCLOSURE_ESCALATED, userId, targetUserId, { friendshipId, level })
        .catch(() => {});

      return {
        friendshipId: existing.friendshipId,
        fromUserId: existing.fromUserId,
        toUserId: existing.toUserId,
        level: existing.level.value,
        levelLabel: existing.level.label,
      };
    }

    const setting = DisclosureSetting.create({
      id: crypto.randomUUID(),
      friendshipId,
      fromUserId: userId,
      toUserId: targetUserId,
      level: newLevel,
      updatedAt: new Date(),
    });

    await this.deps.disclosureRepository.save(setting);

    this.deps.eventTracker
      ?.track(RELATIONSHIP_EVENT_TYPES.DISCLOSURE_ESCALATED, userId, targetUserId, { friendshipId, level })
      .catch(() => {});

    return {
      friendshipId: setting.friendshipId,
      fromUserId: setting.fromUserId,
      toUserId: setting.toUserId,
      level: setting.level.value,
      levelLabel: DISCLOSURE_LEVEL_LABELS[setting.level.value as DisclosureLevelValue],
    };
  }
}
