import { ToneSuggestion, type ToneUserChoice, type ToneAlternative } from "@/domain/value-objects/tone-suggestion";

export interface CheckToneInput {
  originalText: string;
  suggestedText: string;
  alternatives?: ToneAlternative[];
}

export interface CheckToneResult {
  originalText: string;
  suggestedText: string;
  alternatives: readonly ToneAlternative[];
  isSuggested: boolean;
  displayDelayMs: number;
  userChoice: ToneUserChoice | null;
}

export class CheckToneUseCase {
  execute(input: CheckToneInput): CheckToneResult {
    const ts = ToneSuggestion.create(input);
    return {
      originalText: ts.originalText,
      suggestedText: ts.suggestedText,
      alternatives: ts.alternatives,
      isSuggested: ts.isSuggested,
      displayDelayMs: ToneSuggestion.DISPLAY_DELAY_MS,
      userChoice: ts.userChoice,
    };
  }
}
