import { BadExperienceDetector } from "@/domain/value-objects/bad-experience-detector";

interface DetectBadExperienceInput {
  feelHeardScore: number;
  emotionalCheckinNegative: boolean;
}

interface DetectBadExperienceResult {
  triggered: boolean;
  feelHeardScore: number;
  emotionalCheckinNegative: boolean;
}

export class DetectBadExperienceUseCase {
  execute(input: DetectBadExperienceInput): DetectBadExperienceResult {
    const triggered = BadExperienceDetector.shouldTrigger(
      input.feelHeardScore,
      input.emotionalCheckinNegative,
    );
    return {
      triggered,
      feelHeardScore: input.feelHeardScore,
      emotionalCheckinNegative: input.emotionalCheckinNegative,
    };
  }
}
