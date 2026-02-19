import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import type { MatchRepository } from "@/domain/interfaces/match-repository";
import type { MatchCandidateOutput, AdaptiveMatchResult } from "../dtos/match-output";
import { OpinionDistance } from "@/domain/value-objects/opinion-distance";
import { ReadinessScore } from "@/domain/value-objects/readiness-score";
import { MatchScore } from "@/domain/value-objects/match-score";
import { MatchCandidate } from "@/domain/entities/match-candidate";
import {
  DistanceSafetyPackage,
  type SafetyPackageInput,
} from "@/domain/services/distance-safety-package";

export interface FindMatchCandidatesDeps {
  stanceRepository: StanceRepository;
  matchRepository: MatchRepository;
}

export interface AdaptiveMatchOptions {
  confidence?: number;
  fatigue?: number;
  isFirstDialogue?: boolean;
  recentSatisfaction?: number;
}

export class FindMatchCandidatesUseCase {
  private deps: FindMatchCandidatesDeps;

  constructor(deps: FindMatchCandidatesDeps) {
    this.deps = deps;
  }

  async execute(sessionId: string): Promise<MatchCandidateOutput[]>;
  async execute(
    sessionId: string,
    options: AdaptiveMatchOptions,
  ): Promise<AdaptiveMatchResult>;
  async execute(
    sessionId: string,
    options?: AdaptiveMatchOptions,
  ): Promise<MatchCandidateOutput[] | AdaptiveMatchResult> {
    const myProfile =
      await this.deps.stanceRepository.findBySessionId(sessionId);
    if (!myProfile) {
      if (options) {
        return {
          candidates: [],
          bandMin: 0.4,
          bandMax: 0.7,
          topicLevelMin: 0,
          topicLevelMax: 1,
          facilitatorIntensity: "MEDIUM",
          reflectionLevel: "SUMMARY_ONLY",
        };
      }
      return [];
    }

    // Calculate adaptive band if options provided
    const safetyPackage = options
      ? DistanceSafetyPackage.calculate({
          readiness: myProfile.readiness,
          confidence: options.confidence ?? 0.5,
          fatigue: options.fatigue ?? 0,
          isFirstDialogue: options.isFirstDialogue ?? false,
          recentSatisfaction: options.recentSatisfaction ?? 0.5,
        })
      : null;

    const bandMin = safetyPackage?.band.min ?? 0.4;
    const bandMax = safetyPackage?.band.max ?? 0.7;

    const otherProfiles =
      await this.deps.matchRepository.findCandidateProfiles(sessionId);

    const candidates: MatchCandidate[] = [];

    for (const profile of otherProfiles) {
      const distanceValue = myProfile.vector.cosineDistance(
        profile.vector,
      );

      if (distanceValue < 0 || distanceValue > 2) continue;

      const distance = OpinionDistance.create(distanceValue);

      // Use adaptive band or fixed sweet spot
      const inBand = safetyPackage
        ? safetyPackage.band.contains(distance.value)
        : distance.isInSweetSpot();
      if (!inBand) continue;

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

    const candidateOutputs: MatchCandidateOutput[] = candidates.map((c) => ({
      sessionId: c.sessionId,
      distance: c.distance.value,
      readiness: c.readiness.value,
      score: c.score.value,
      inSweetSpot: c.isInSweetSpot(),
    }));

    if (options && safetyPackage) {
      return {
        candidates: candidateOutputs,
        bandMin: safetyPackage.band.min,
        bandMax: safetyPackage.band.max,
        topicLevelMin: safetyPackage.topicLevelMin,
        topicLevelMax: safetyPackage.topicLevelMax,
        facilitatorIntensity: safetyPackage.facilitatorIntensity,
        reflectionLevel: safetyPackage.reflectionLevel,
      };
    }

    return candidateOutputs;
  }
}
