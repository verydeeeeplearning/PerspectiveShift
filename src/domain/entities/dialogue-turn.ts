import type { DialogueStep } from "../value-objects/dialogue-step";

export interface DialogueTurnProps {
  id: string;
  sessionId: string;
  step: DialogueStep;
  participantId: string;
  content: string;
  createdAt: Date;
}

export class DialogueTurn {
  readonly id: string;
  readonly sessionId: string;
  readonly step: DialogueStep;
  readonly participantId: string;
  readonly content: string;
  readonly createdAt: Date;

  private constructor(props: DialogueTurnProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.step = props.step;
    this.participantId = props.participantId;
    this.content = props.content;
    this.createdAt = props.createdAt;
  }

  static create(props: DialogueTurnProps): DialogueTurn {
    return new DialogueTurn(props);
  }
}
