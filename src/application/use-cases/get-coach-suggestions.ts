import { CoachSuggestion, type CoachMethodKey } from "@/domain/value-objects/coach-suggestion";

export interface CoachSuggestionItem {
  method: CoachMethodKey;
  label: string;
  template: string;
}

export interface CoachSuggestionsResult {
  suggestions: CoachSuggestionItem[];
}

export class GetCoachSuggestionsUseCase {
  execute(): CoachSuggestionsResult {
    const suggestions = CoachSuggestion.all().map((s) => ({
      method: s.method,
      label: s.label,
      template: s.template,
    }));
    return { suggestions };
  }
}
