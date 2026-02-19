import {
  InvalidUnderstandingScoreError,
  InvalidFeelHeardScoreError,
} from "@/domain/errors/domain-errors";

interface JointSummaryCardProps {
  agreedPoints: string[];
  disagreedPoints: string[];
  sharedQuestion: string | null;
  dialogueId: string;
  // v4 P0-D2 enhanced fields (all optional for backwards compatibility)
  topic?: string;
  date?: string;
  myKeyPoint?: string;
  opponentKeyPoint?: string;
  commonGround?: string | null;
  newDiscovery?: string | null;
  understandingScore?: number;
  feelHeardScore?: number;
  autoSaved?: boolean;
}

export class JointSummaryCard {
  readonly agreedPoints: readonly string[];
  readonly disagreedPoints: readonly string[];
  readonly sharedQuestion: string | null;
  readonly dialogueId: string;
  // v4 P0-D2 enhanced fields
  readonly topic: string;
  readonly date: string;
  readonly myKeyPoint: string;
  readonly opponentKeyPoint: string;
  readonly commonGround: string | null;
  readonly newDiscovery: string | null;
  readonly understandingScore: number;
  readonly feelHeardScore: number;
  readonly autoSaved: boolean;

  private constructor(props: Required<Omit<JointSummaryCardProps, 'topic' | 'date' | 'myKeyPoint' | 'opponentKeyPoint' | 'commonGround' | 'newDiscovery' | 'understandingScore' | 'feelHeardScore' | 'autoSaved'>> & {
    topic: string;
    date: string;
    myKeyPoint: string;
    opponentKeyPoint: string;
    commonGround: string | null;
    newDiscovery: string | null;
    understandingScore: number;
    feelHeardScore: number;
    autoSaved: boolean;
  }) {
    this.agreedPoints = Object.freeze([...props.agreedPoints]);
    this.disagreedPoints = Object.freeze([...props.disagreedPoints]);
    this.sharedQuestion = props.sharedQuestion;
    this.dialogueId = props.dialogueId;
    this.topic = props.topic;
    this.date = props.date;
    this.myKeyPoint = props.myKeyPoint;
    this.opponentKeyPoint = props.opponentKeyPoint;
    this.commonGround = props.commonGround;
    this.newDiscovery = props.newDiscovery;
    this.understandingScore = props.understandingScore;
    this.feelHeardScore = props.feelHeardScore;
    this.autoSaved = props.autoSaved;
  }

  static create(props: JointSummaryCardProps): JointSummaryCard {
    if (props.agreedPoints.length === 0 && props.disagreedPoints.length === 0) {
      throw new Error("Must have at least one agreed or disagreed point");
    }

    const understandingScore = props.understandingScore ?? 0;
    if (understandingScore < 0 || understandingScore > 1) {
      throw new InvalidUnderstandingScoreError(understandingScore);
    }

    const feelHeardScore = props.feelHeardScore ?? 0;
    // 0 is the default "not yet rated" sentinel; explicit values must be 1-5
    if (feelHeardScore !== 0 && (feelHeardScore < 1 || feelHeardScore > 5)) {
      throw new InvalidFeelHeardScoreError(feelHeardScore);
    }

    return new JointSummaryCard({
      agreedPoints: props.agreedPoints,
      disagreedPoints: props.disagreedPoints,
      sharedQuestion: props.sharedQuestion,
      dialogueId: props.dialogueId,
      topic: props.topic ?? "",
      date: props.date ?? "",
      myKeyPoint: props.myKeyPoint ?? "",
      opponentKeyPoint: props.opponentKeyPoint ?? "",
      commonGround: props.commonGround ?? null,
      newDiscovery: props.newDiscovery ?? null,
      understandingScore,
      feelHeardScore,
      autoSaved: props.autoSaved ?? true,
    });
  }
}
