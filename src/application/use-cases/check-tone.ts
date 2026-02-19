import { ToneSuggestion, type ToneUserChoice } from "@/domain/value-objects/tone-suggestion";

export interface CheckToneInput {
  originalText: string;
  suggestedText: string;
}

export interface CheckToneResult {
  originalText: string;
  suggestedText: string;
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
      isSuggested: ts.isSuggested,
      displayDelayMs: ToneSuggestion.DISPLAY_DELAY_MS,
      userChoice: ts.userChoice,
    };
  }
}
