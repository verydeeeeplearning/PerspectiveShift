interface RoleplaySteelmanProps {
  oppositeRolePrompt: string;
  userResponse?: string | null;
  isSkipped?: boolean;
}

const FORCE_THRESHOLD_SCORE = 50;
const OPTIONAL_DIALOGUE_COUNT = 3;

export class RoleplaySteelman {
  readonly oppositeRolePrompt: string;
  readonly userResponse: string | null;
  readonly isSkipped: boolean;

  private constructor(props: {
    oppositeRolePrompt: string;
    userResponse: string | null;
    isSkipped: boolean;
  }) {
    this.oppositeRolePrompt = props.oppositeRolePrompt;
    this.userResponse = props.userResponse;
    this.isSkipped = props.isSkipped;
  }

  static create(props: RoleplaySteelmanProps): RoleplaySteelman {
    if (!props.oppositeRolePrompt.trim()) {
      throw new Error("oppositeRolePrompt must not be empty");
    }
    return new RoleplaySteelman({
      oppositeRolePrompt: props.oppositeRolePrompt,
      userResponse: props.userResponse?.trim() || null,
      isSkipped: props.isSkipped ?? false,
    });
  }

  complete(response: string): RoleplaySteelman {
    if (!response.trim()) {
      throw new Error("Response must not be empty");
    }
    return new RoleplaySteelman({
      oppositeRolePrompt: this.oppositeRolePrompt,
      userResponse: response.trim(),
      isSkipped: false,
    });
  }

  skip(): RoleplaySteelman {
    return new RoleplaySteelman({
      oppositeRolePrompt: this.oppositeRolePrompt,
      userResponse: null,
      isSkipped: true,
    });
  }

  static isForceRequired(dialogueCount: number, understandingScore: number): boolean {
    if (dialogueCount <= OPTIONAL_DIALOGUE_COUNT) return false;
    return understandingScore < FORCE_THRESHOLD_SCORE;
  }
}
