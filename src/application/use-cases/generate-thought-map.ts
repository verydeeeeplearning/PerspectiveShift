import { StanceVector } from "@/domain/entities/stance-vector";
import { ThoughtMap } from "@/domain/entities/thought-map";
import type { BaselineProvider } from "@/domain/interfaces/baseline-provider";
import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import {
  ALL_DIMENSIONS,
  DIMENSION_LABELS,
} from "@/domain/value-objects/stance-dimension";
import type { StanceResultOutput } from "../dtos/stance-result-output";
import type { ThoughtMapOutput } from "../dtos/thought-map-output";

export interface GenerateThoughtMapDeps {
  baselineProvider: BaselineProvider;
  stanceRepository: StanceRepository;
}

export class GenerateThoughtMapUseCase {
  constructor(private readonly deps: GenerateThoughtMapDeps) {}

  async execute(
    stanceResult: StanceResultOutput,
  ): Promise<ThoughtMapOutput> {
    const vector = StanceVector.fromValues(stanceResult.vector);

    const percentiles = ALL_DIMENSIONS.map((dim) => ({
      dimension: dim,
      percentile: this.deps.baselineProvider.calculatePercentile(
        dim,
        stanceResult.vector[dim],
      ),
    }));

    const thoughtMap = ThoughtMap.create({
      vector,
      percentiles,
      precision: stanceResult.precision,
    });

    await this.deps.stanceRepository.save({
      id: crypto.randomUUID(),
      sessionId: stanceResult.sessionId,
      vector,
      mapType: thoughtMap.mapType.name,
      reasoning: stanceResult.reasoning,
      readiness: stanceResult.readiness,
      precision: stanceResult.precision,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const baseline = this.deps.baselineProvider.getBaseline();

    return {
      sessionId: stanceResult.sessionId,
      vector: stanceResult.vector,
      mapType: {
        name: thoughtMap.mapType.name,
        alias: thoughtMap.mapType.alias,
        emoji: thoughtMap.mapType.emoji,
        description: thoughtMap.mapType.description,
      },
      alias: {
        key: thoughtMap.alias.key,
        label: thoughtMap.alias.label,
        emoji: thoughtMap.alias.emoji,
        description: thoughtMap.alias.description,
      },
      percentiles: percentiles.map((p) => ({
        dimension: p.dimension,
        label: DIMENSION_LABELS[p.dimension],
        percentile: p.percentile,
        value: stanceResult.vector[p.dimension],
      })),
      precision: stanceResult.precision,
      baselineLabel: baseline.label,
    };
  }
}
