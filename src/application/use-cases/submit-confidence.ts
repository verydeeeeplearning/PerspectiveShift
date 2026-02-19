import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import { ConfidenceMap } from "@/domain/value-objects/confidence-map";
import { ConfidenceLevel } from "@/domain/value-objects/confidence-level";
import type { SubmitConfidenceInput } from "../dtos/confidence-input";

export class SubmitConfidenceUseCase {
  constructor(private readonly stanceRepo: StanceRepository) {}

  async execute(input: SubmitConfidenceInput): Promise<void> {
    const profile = await this.stanceRepo.findBySessionId(input.sessionId);
    if (!profile) {
      throw new Error(
        `Stance profile for session ${input.sessionId} not found`,
      );
    }

    let confidenceMap = ConfidenceMap.default();

    for (const dim of input.highConfidenceDimensions) {
      confidenceMap = confidenceMap.update(
        dim as StanceDimension,
        ConfidenceLevel.create("HIGH"),
      );
    }

    await this.stanceRepo.update(input.sessionId, {
      confidenceMap: confidenceMap.toRecord(),
    });
  }
}
