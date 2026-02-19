import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import type { ValueExtractor } from "@/domain/interfaces/value-extractor";
import type { SubmitSelfAffirmationInput } from "../dtos/self-affirmation-input";

export class SubmitSelfAffirmationUseCase {
  constructor(
    private readonly stanceRepo: StanceRepository,
    private readonly valueExtractor: ValueExtractor,
  ) {}

  async execute(input: SubmitSelfAffirmationInput): Promise<void> {
    const profile = await this.stanceRepo.findBySessionId(input.sessionId);
    if (!profile) {
      throw new Error(`Stance profile for session ${input.sessionId} not found`);
    }

    // LLM value priority extraction is best-effort
    if (input.experience) {
      try {
        await this.valueExtractor.extractValuePriority(input.experience);
      } catch {
        // Silently ignore LLM extraction failures
      }
    }

    await this.stanceRepo.update(input.sessionId, {
      coreValue: input.coreValue,
      selfAffirmationExperience: input.experience ?? null,
    });
  }
}
