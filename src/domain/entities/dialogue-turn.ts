import type { DialogueStep } from "../value-objects/dialogue-step";
import type { PersonalContext } from "../value-objects/personal-context";

export interface DialogueTurnProps {
  id: string;
  sessionId: string;
  step: DialogueStep;
  participantId: string;
  content: string;
  personalContext?: PersonalContext;
  createdAt: Date;
}

export class DialogueTurn {
  readonly id: string;
  readonly sessionId: string;
  readonly step: DialogueStep;
  readonly participantId: string;
  readonly content: string;
  readonly personalContext: PersonalContext | null;
  readonly createdAt: Date;

  private constructor(props: DialogueTurnProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.step = props.step;
    this.participantId = props.participantId;
    this.content = props.content;
    this.personalContext = props.personalContext ?? null;
    this.createdAt = props.createdAt;
  }

  static create(props: DialogueTurnProps): DialogueTurn {
    return new DialogueTurn(props);
  }
}
