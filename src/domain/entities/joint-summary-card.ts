interface JointSummaryCardProps {
  agreedPoints: string[];
  disagreedPoints: string[];
  sharedQuestion: string | null;
  dialogueId: string;
}

export class JointSummaryCard {
  readonly agreedPoints: readonly string[];
  readonly disagreedPoints: readonly string[];
  readonly sharedQuestion: string | null;
  readonly dialogueId: string;

  private constructor(props: JointSummaryCardProps) {
    this.agreedPoints = Object.freeze([...props.agreedPoints]);
    this.disagreedPoints = Object.freeze([...props.disagreedPoints]);
    this.sharedQuestion = props.sharedQuestion;
    this.dialogueId = props.dialogueId;
  }

  static create(props: JointSummaryCardProps): JointSummaryCard {
    if (props.agreedPoints.length === 0 && props.disagreedPoints.length === 0) {
      throw new Error("Must have at least one agreed or disagreed point");
    }
    return new JointSummaryCard(props);
  }
}
