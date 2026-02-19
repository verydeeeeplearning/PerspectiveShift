export interface SavedPersonaProps {
  userId: string;
  personaId: string;
  conversationCount: number;
  lastConversationAt: Date;
  conversationSummaries: string[];
  sharedContext: string[];
  userStanceMemory: string[];
  savedQuestions: string[];
}

export class SavedPersona {
  readonly userId: string;
  readonly personaId: string;
  readonly conversationCount: number;
  readonly lastConversationAt: Date;
  readonly conversationSummaries: readonly string[];
  readonly sharedContext: readonly string[];
  readonly userStanceMemory: readonly string[];
  readonly savedQuestions: readonly string[];

  private constructor(props: SavedPersonaProps) {
    this.userId = props.userId;
    this.personaId = props.personaId;
    this.conversationCount = props.conversationCount;
    this.lastConversationAt = props.lastConversationAt;
    this.conversationSummaries = Object.freeze([...props.conversationSummaries]);
    this.sharedContext = Object.freeze([...props.sharedContext]);
    this.userStanceMemory = Object.freeze([...props.userStanceMemory]);
    this.savedQuestions = Object.freeze([...props.savedQuestions]);
  }

  static create(props: SavedPersonaProps): SavedPersona {
    if (!props.userId.trim()) {
      throw new Error("SavedPersona userId must not be empty");
    }
    if (!props.personaId.trim()) {
      throw new Error("SavedPersona personaId must not be empty");
    }
    if (props.conversationCount < 0) {
      throw new Error("SavedPersona conversationCount must be >= 0");
    }
    return new SavedPersona(props);
  }

  static initialize(userId: string, personaId: string): SavedPersona {
    return SavedPersona.create({
      userId,
      personaId,
      conversationCount: 0,
      lastConversationAt: new Date(),
      conversationSummaries: [],
      sharedContext: [],
      userStanceMemory: [],
      savedQuestions: [],
    });
  }

  appendConversation(input: {
    summary: string;
    sharedContext?: readonly string[];
    userStanceMemory?: readonly string[];
    savedQuestions?: readonly string[];
    now?: Date;
  }): SavedPersona {
    return SavedPersona.create({
      userId: this.userId,
      personaId: this.personaId,
      conversationCount: this.conversationCount + 1,
      lastConversationAt: input.now ?? new Date(),
      conversationSummaries: this.pushWithLimit(this.conversationSummaries, input.summary, 5),
      sharedContext: this.mergeUnique(this.sharedContext, input.sharedContext ?? []),
      userStanceMemory: this.mergeUnique(this.userStanceMemory, input.userStanceMemory ?? []),
      savedQuestions: this.mergeUnique(this.savedQuestions, input.savedQuestions ?? []),
    });
  }

  private pushWithLimit(
    source: readonly string[],
    item: string,
    maxLength: number,
  ): string[] {
    if (!item.trim()) return [...source];
    const next = [...source, item.trim()];
    return next.slice(Math.max(0, next.length - maxLength));
  }

  private mergeUnique(source: readonly string[], incoming: readonly string[]): string[] {
    const merged = new Set(source);
    for (const item of incoming) {
      const normalized = item.trim();
      if (normalized) {
        merged.add(normalized);
      }
    }
    return [...merged];
  }
}
