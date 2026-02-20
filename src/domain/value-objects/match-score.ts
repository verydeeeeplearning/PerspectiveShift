import type { OpinionDistance } from "./opinion-distance";
import type { ReadinessScore } from "./readiness-score";

const W_DISTANCE = 0.35;
const W_READINESS = 0.25;
const W_TOPIC = 0.2;
const W_ENERGY = 0.2;

export interface MatchScoreComponents {
  distanceFit: number;
  readinessComponent: number;
  topicRelevance: number;
  energyCompat: number;
  declinePenalty: number;
  poolScarcityBonus: number;
}

export interface MatchScoreOptions {
  topicRelevance?: number;
  energyCompat?: number;
  declinePenalty?: number;
  poolScarcityBonus?: number;
}

export class MatchScore {
  readonly value: number;
  readonly distanceFit: number;
  readonly readinessComponent: number;
  readonly topicRelevance: number;
  readonly energyCompat: number;
  readonly declinePenalty: number;
  readonly poolScarcityBonus: number;

  private constructor(components: MatchScoreComponents) {
    this.distanceFit = Math.round(components.distanceFit * 1000) / 1000;
    this.readinessComponent =
      Math.round(components.readinessComponent * 1000) / 1000;
    this.topicRelevance =
      Math.round(components.topicRelevance * 1000) / 1000;
    this.energyCompat =
      Math.round(components.energyCompat * 1000) / 1000;
    this.declinePenalty =
      Math.round(components.declinePenalty * 1000) / 1000;
    this.poolScarcityBonus =
      Math.round(components.poolScarcityBonus * 1000) / 1000;
    const raw =
      this.distanceFit * W_DISTANCE +
      this.readinessComponent * W_READINESS +
      this.topicRelevance * W_TOPIC +
      this.energyCompat * W_ENERGY -
      this.declinePenalty +
      this.poolScarcityBonus;
    this.value = Math.round(Math.max(0, Math.min(1, raw)) * 1000) / 1000;
  }

  static calculate(
    distance: OpinionDistance,
    readiness: ReadinessScore,
    options?: MatchScoreOptions,
  ): MatchScore {
    const distanceFit = distance.isInSweetSpot()
      ? Math.max(0, 1 - Math.abs(distance.value - 0.55) / 0.15)
      : 0;
    return new MatchScore({
      distanceFit,
      readinessComponent: readiness.value,
      topicRelevance: options?.topicRelevance ?? 0.5,
      energyCompat: options?.energyCompat ?? 0.5,
      declinePenalty: options?.declinePenalty ?? 0,
      poolScarcityBonus: options?.poolScarcityBonus ?? 0,
    });
  }

  equals(other: MatchScore): boolean {
    return this.value === other.value;
  }
}
