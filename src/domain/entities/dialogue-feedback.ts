export interface DialogueFeedbackProps {
  id: string;
  sessionId: string;
  participantId: string;
  satisfaction: number;
  rematchWillingness: boolean;
  emotionCheckIn: string | null;
  createdAt: Date;
}

export class DialogueFeedback {
  readonly id: string;
  readonly sessionId: string;
  readonly participantId: string;
  readonly satisfaction: number;
  readonly rematchWillingness: boolean;
  readonly emotionCheckIn: string | null;
  readonly createdAt: Date;

  private constructor(props: DialogueFeedbackProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.participantId = props.participantId;
    this.satisfaction = props.satisfaction;
    this.rematchWillingness = props.rematchWillingness;
    this.emotionCheckIn = props.emotionCheckIn;
    this.createdAt = props.createdAt;
  }

  static create(props: DialogueFeedbackProps): DialogueFeedback {
    if (props.satisfaction < 1 || props.satisfaction > 5) {
      throw new Error(
        `Satisfaction must be between 1 and 5, got ${props.satisfaction}`,
      );
    }
    return new DialogueFeedback(props);
  }
}
