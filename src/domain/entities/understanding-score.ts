export interface UnderstandingScoreProps {
  id: string;
  sessionId: string;
  participantId: string;
  score: number;
  evaluation: string;
  createdAt: Date;
}

export class UnderstandingScore {
  readonly id: string;
  readonly sessionId: string;
  readonly participantId: string;
  readonly score: number;
  readonly evaluation: string;
  readonly createdAt: Date;

  private constructor(props: UnderstandingScoreProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.participantId = props.participantId;
    this.score = props.score;
    this.evaluation = props.evaluation;
    this.createdAt = props.createdAt;
  }

  static create(props: UnderstandingScoreProps): UnderstandingScore {
    if (props.score < 0 || props.score > 1) {
      throw new Error(
        `Understanding score must be between 0 and 1, got ${props.score}`,
      );
    }
    return new UnderstandingScore(props);
  }
}
