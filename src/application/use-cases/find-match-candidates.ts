import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import type { MatchRepository } from "@/domain/interfaces/match-repository";
import type { PersonaRepository } from "@/domain/interfaces/persona-repository";
import type { MatchCandidateOutput, AdaptiveMatchResult } from "../dtos/match-output";
import { OpinionDistance } from "@/domain/value-objects/opinion-distance";
import { ReadinessScore } from "@/domain/value-objects/readiness-score";
import { MatchScore } from "@/domain/value-objects/match-score";
import { MatchCandidate } from "@/domain/entities/match-candidate";
import { DistanceSafetyPackage } from "@/domain/services/distance-safety-package";
import type { EnergyLevelKey } from "@/domain/value-objects/energy-level";

const DECLINE_PENALTY = 0.15;
const AGENT_BASE_READINESS = 0.78;

const ENERGY_ORDER: EnergyLevelKey[] = ["LOW", "NORMAL", "HIGH"];

function energyIndex(level: EnergyLevelKey): number {
  return ENERGY_ORDER.indexOf(level);
}

export function computeEnergyCompat(
  a: EnergyLevelKey,
  b: EnergyLevelKey,
): number {
  const diff = Math.abs(energyIndex(a) - energyIndex(b));
  if (diff === 0) return 1.0;
  if (diff === 1) return 0.7;
  return 0.3;
}

export interface FindMatchCandidatesDeps {
  stanceRepository: StanceRepository;
  matchRepository: MatchRepository;
  personaRepository: PersonaRepository;
}

export interface AdaptiveMatchOptions {
  confidence?: number;
  fatigue?: number;
  isFirstDialogue?: boolean;
  recentSatisfaction?: number;
  energyLevel?: EnergyLevelKey;
  recentlyDeclinedSessionIds?: string[];
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

    const declinedSet = new Set(options?.recentlyDeclinedSessionIds ?? []);
    const myEnergy = options?.energyLevel;

    const otherProfiles =
      await this.deps.matchRepository.findCandidateProfiles(sessionId);
    const personas = await this.deps.personaRepository.findAll();

    const humanCandidates: MatchCandidate[] = [];
    for (const profile of otherProfiles) {
      const candidate = this.buildCandidate({
        sessionId: profile.sessionId,
        distanceValue: myProfile.vector.cosineDistance(profile.vector),
        readinessValue: profile.readiness,
        candidateType: "human",
        myEnergy,
        declinedSet,
        safetyPackage,
        poolScarcityBonus: 0,
      });
      if (candidate) {
        humanCandidates.push(candidate);
      }
    }

    const poolScarcityBonus = this.getPoolScarcityBonus(otherProfiles.length);
    const agentCandidates: MatchCandidate[] = [];
    for (const persona of personas) {
      const candidate = this.buildCandidate({
        sessionId: `agent-${persona.id}`,
        distanceValue: myProfile.vector.cosineDistance(persona.stanceVector),
        readinessValue: AGENT_BASE_READINESS,
        candidateType: "agent",
        personaId: persona.id,
        myEnergy,
        declinedSet,
        safetyPackage,
        poolScarcityBonus,
      });
      if (candidate) {
        agentCandidates.push(candidate);
      }
    }

    const candidates = [...humanCandidates, ...agentCandidates].sort(
      (a, b) => b.score.value - a.score.value,
    );

    const candidateOutputs: MatchCandidateOutput[] = candidates.map((c) => ({
      sessionId: c.sessionId,
      candidateType: c.candidateType,
      personaId: c.personaId,
      distance: c.distance.value,
      readiness: c.readiness.value,
      score: c.score.value,
      inSweetSpot: c.isInSweetSpot(),
      poolScarcityBonus: c.score.poolScarcityBonus,
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

  private buildCandidate(input: {
    sessionId: string;
    distanceValue: number;
    readinessValue: number;
    candidateType: "human" | "agent";
    personaId?: string;
    myEnergy?: EnergyLevelKey;
    declinedSet: Set<string>;
    safetyPackage: ReturnType<typeof DistanceSafetyPackage.calculate> | null;
    poolScarcityBonus: number;
  }): MatchCandidate | null {
    if (input.distanceValue < 0 || input.distanceValue > 2) {
      return null;
    }

    const distance = OpinionDistance.create(input.distanceValue);
    const inBand = input.safetyPackage
      ? input.safetyPackage.band.contains(distance.value)
      : distance.isInSweetSpot();
    if (!inBand) {
      return null;
    }

    const readiness = ReadinessScore.create(
      Math.min(1, Math.max(0, input.readinessValue)),
    );
    const energyCompat = input.myEnergy
      ? computeEnergyCompat(input.myEnergy, "NORMAL")
      : 0.5;
    const declinePenalty = input.declinedSet.has(input.sessionId)
      ? DECLINE_PENALTY
      : 0;
    const score = MatchScore.calculate(distance, readiness, {
      energyCompat,
      declinePenalty,
      poolScarcityBonus:
        input.candidateType === "agent" ? input.poolScarcityBonus : 0,
    });

    return MatchCandidate.create({
      sessionId: input.sessionId,
      distance,
      readiness,
      score,
      energyCompat,
      recentDeclinePenalty: declinePenalty,
      candidateType: input.candidateType,
      personaId: input.personaId,
    });
  }

  private getPoolScarcityBonus(humanCount: number): number {
    if (humanCount === 0) return 0.3;
    if (humanCount <= 2) return 0.1;
    return 0;
  }
}
