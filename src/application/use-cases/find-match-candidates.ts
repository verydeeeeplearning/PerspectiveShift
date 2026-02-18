import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import type { MatchRepository } from "@/domain/interfaces/match-repository";
import type { MatchCandidateOutput } from "../dtos/match-output";
import { OpinionDistance } from "@/domain/value-objects/opinion-distance";
import { ReadinessScore } from "@/domain/value-objects/readiness-score";
import { MatchScore } from "@/domain/value-objects/match-score";
import { MatchCandidate } from "@/domain/entities/match-candidate";

export interface FindMatchCandidatesDeps {
  stanceRepository: StanceRepository;
  matchRepository: MatchRepository;
}

export class FindMatchCandidatesUseCase {
  private deps: FindMatchCandidatesDeps;

  constructor(deps: FindMatchCandidatesDeps) {
    this.deps = deps;
  }

  async execute(sessionId: string): Promise<MatchCandidateOutput[]> {
    const myProfile =
      await this.deps.stanceRepository.findBySessionId(sessionId);
    if (!myProfile) return [];

    const otherProfiles =
      await this.deps.matchRepository.findCandidateProfiles(sessionId);

    const candidates: MatchCandidate[] = [];

    for (const profile of otherProfiles) {
      const distanceValue = myProfile.vector.cosineDistance(
        profile.vector,
      );

      if (distanceValue < 0 || distanceValue > 2) continue;

      const distance = OpinionDistance.create(distanceValue);
      if (!distance.isInSweetSpot()) continue;

      const readiness = ReadinessScore.create(
        Math.min(1, Math.max(0, profile.readiness)),
      );
      const score = MatchScore.calculate(distance, readiness);

      candidates.push(
        MatchCandidate.create({
          sessionId: profile.sessionId,
          distance,
          readiness,
          score,
        }),
      );
    }

    candidates.sort((a, b) => b.score.value - a.score.value);

    return candidates.map((c) => ({
      sessionId: c.sessionId,
      distance: c.distance.value,
      readiness: c.readiness.value,
      score: c.score.value,
      inSweetSpot: c.isInSweetSpot(),
    }));
  }
}
