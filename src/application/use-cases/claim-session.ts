import type { UserRepository } from "@/domain/interfaces/user-repository";
import type { ClaimSessionOutput } from "../dtos/auth-output";
import { UserProfile } from "@/domain/entities/user-profile";
import { SessionAlreadyClaimedError } from "@/domain/errors/domain-errors";

export interface ClaimSessionDeps {
  userRepository: UserRepository;
}

export class ClaimSessionUseCase {
  private deps: ClaimSessionDeps;

  constructor(deps: ClaimSessionDeps) {
    this.deps = deps;
  }

  async execute(
    userId: string,
    sessionId: string,
  ): Promise<ClaimSessionOutput> {
    // Check if session is already claimed by another user
    const existingOwner =
      await this.deps.userRepository.findBySessionId(sessionId);
    if (existingOwner && existingOwner.userId !== userId) {
      throw new SessionAlreadyClaimedError(sessionId);
    }

    // Find or create user profile
    let profile = await this.deps.userRepository.findById(userId);

    if (!profile) {
      const alias = `참여자_${userId.slice(0, 4).toUpperCase()}`;
      profile = UserProfile.create({
        userId,
        displayAlias: alias,
        claimedSessionIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.deps.userRepository.save(profile);
    }

    // Check if already claimed by this user
    if (profile.hasClaimedSession(sessionId)) {
      return {
        userId,
        sessionId,
        alreadyClaimed: true,
      };
    }

    // Claim the session
    profile.claimSession(sessionId);
    await this.deps.userRepository.update(profile);

    return {
      userId,
      sessionId,
      alreadyClaimed: false,
    };
  }
}
