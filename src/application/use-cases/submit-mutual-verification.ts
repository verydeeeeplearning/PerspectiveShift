import { MutualVerification } from "@/domain/value-objects/mutual-verification";

interface SubmitVerificationInput {
  summarizedByOpponent: string;
  accuracySlider: number;
  correctionText?: string | null;
}

interface SubmitVerificationResult {
  accuracySlider: number;
  emoji: string;
  hasCorrection: boolean;
  correctionText: string | null;
}

export class SubmitMutualVerificationUseCase {
  execute(input: SubmitVerificationInput): SubmitVerificationResult {
    const mv = MutualVerification.create(input);
    return {
      accuracySlider: mv.accuracySlider,
      emoji: mv.emoji,
      hasCorrection: mv.hasCorrection,
      correctionText: mv.correctionText,
    };
  }
}
