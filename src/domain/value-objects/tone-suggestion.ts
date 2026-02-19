export type ToneUserChoice = "USE_ALTERNATIVE_A" | "USE_ALTERNATIVE_B" | "USE_ALTERNATIVE_C" | "SEND_ORIGINAL";

export type ToneAlternativeCategory = "summary_confirm" | "interest_reason" | "uncertainty";

export interface ToneAlternative {
  category: ToneAlternativeCategory;
  text: string;
  label: string;
}

interface ToneSuggestionProps {
  originalText: string;
  suggestedText: string;
  alternatives: ToneAlternative[];
  userChoice?: ToneUserChoice | null;
}

export class ToneSuggestion {
  static readonly DISPLAY_DELAY_MS = 500;

  readonly originalText: string;
  readonly suggestedText: string;
  readonly alternatives: readonly ToneAlternative[];
  readonly userChoice: ToneUserChoice | null;

  private constructor(props: ToneSuggestionProps) {
    this.originalText = props.originalText;
    this.suggestedText = props.suggestedText;
    this.alternatives = Object.freeze([...props.alternatives]);
    this.userChoice = props.userChoice ?? null;
  }

  static create(props: {
    originalText: string;
    suggestedText: string;
    alternatives?: ToneAlternative[];
  }): ToneSuggestion {
    if (!props.originalText.trim()) {
      throw new Error("originalText must not be empty");
    }
    if (!props.suggestedText.trim()) {
      throw new Error("suggestedText must not be empty");
    }
    const alternatives = props.alternatives ?? [
      {
        category: "summary_confirm" as const,
        text: props.suggestedText,
        label: "추천 표현",
      },
    ];
    return new ToneSuggestion({ ...props, alternatives });
  }

  get isSuggested(): boolean {
    return this.originalText !== this.suggestedText;
  }

  get finalText(): string {
    if (this.userChoice === "USE_ALTERNATIVE_A" && this.alternatives[0]) return this.alternatives[0].text;
    if (this.userChoice === "USE_ALTERNATIVE_B" && this.alternatives[1]) return this.alternatives[1].text;
    if (this.userChoice === "USE_ALTERNATIVE_C" && this.alternatives[2]) return this.alternatives[2].text;
    if (this.userChoice === "SEND_ORIGINAL") return this.originalText;
    return this.originalText;
  }

  choose(choice: ToneUserChoice): ToneSuggestion {
    return new ToneSuggestion({
      originalText: this.originalText,
      suggestedText: this.suggestedText,
      alternatives: [...this.alternatives],
      userChoice: choice,
    });
  }
}
