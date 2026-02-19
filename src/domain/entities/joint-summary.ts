export interface JointSummaryProps {
  sessionId: string;
  agreedPoints: string[];
  disagreedPoints: string[];
  sharedQuestions: string[];
  llmGenerated: boolean;
}

export class JointSummary {
  readonly sessionId: string;
  readonly agreedPoints: readonly string[];
  readonly disagreedPoints: readonly string[];
  readonly sharedQuestions: readonly string[];
  readonly llmGenerated: boolean;

  private constructor(props: JointSummaryProps) {
    this.sessionId = props.sessionId;
    this.agreedPoints = Object.freeze([...props.agreedPoints]);
    this.disagreedPoints = Object.freeze([...props.disagreedPoints]);
    this.sharedQuestions = Object.freeze([...props.sharedQuestions]);
    this.llmGenerated = props.llmGenerated;
  }

  static create(props: JointSummaryProps): JointSummary {
    return new JointSummary(props);
  }
}
