export type ToneUserChoice = "USE_SUGGESTION" | "SEND_ORIGINAL";

interface ToneSuggestionProps {
  originalText: string;
  suggestedText: string;
  userChoice?: ToneUserChoice | null;
}

export class ToneSuggestion {
  static readonly DISPLAY_DELAY_MS = 500;

  readonly originalText: string;
  readonly suggestedText: string;
  readonly userChoice: ToneUserChoice | null;

  private constructor(props: ToneSuggestionProps) {
    this.originalText = props.originalText;
    this.suggestedText = props.suggestedText;
    this.userChoice = props.userChoice ?? null;
  }

  static create(props: { originalText: string; suggestedText: string }): ToneSuggestion {
    if (!props.originalText.trim()) {
      throw new Error("originalText must not be empty");
    }
    if (!props.suggestedText.trim()) {
      throw new Error("suggestedText must not be empty");
    }
    return new ToneSuggestion(props);
  }

  get isSuggested(): boolean {
    return this.originalText !== this.suggestedText;
  }

  get finalText(): string {
    if (this.userChoice === "USE_SUGGESTION") return this.suggestedText;
    if (this.userChoice === "SEND_ORIGINAL") return this.originalText;
    return this.originalText;
  }

  choose(choice: ToneUserChoice): ToneSuggestion {
    return new ToneSuggestion({
      originalText: this.originalText,
      suggestedText: this.suggestedText,
      userChoice: choice,
    });
  }
}
