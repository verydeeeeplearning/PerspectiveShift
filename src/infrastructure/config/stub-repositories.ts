import type { ReceptivenessRepository } from "@/domain/interfaces/receptiveness-repository";
import type { FollowUpCheckinRepository } from "@/domain/interfaces/follow-up-checkin-repository";
import type { LightProtocolRepository } from "@/domain/interfaces/light-protocol-repository";

export const stubReceptivenessRepo: ReceptivenessRepository = {
  async findByUserId() { return null; }, async save() {},
  async countAllUsers() { return 0; }, async countUsersWithScoreBelow() { return 0; },
};

export const stubLightProtocolRepo: LightProtocolRepository = {
  async save() {}, async findById() { return null; },
  async update() {}, async findByFriendship() { return []; }, async findActiveByFriendship() { return null; },
};

export const stubFollowUpRepo: FollowUpCheckinRepository = {
  async save() {}, async findById() { return null; },
  async findBySessionAndParticipant() { return null; },
  async findPendingByParticipant() { return []; }, async update() {},
};
