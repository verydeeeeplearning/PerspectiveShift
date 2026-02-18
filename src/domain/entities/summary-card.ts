export interface SummaryCardProps {
  id: string;
  sessionId: string;
  keyArguments: { participantA: string[]; participantB: string[] };
  commonGround: string[];
  unresolvedQuestions: string[];
  blindSpots: string[];
  createdAt: Date;
}

export class SummaryCard {
  readonly id: string;
  readonly sessionId: string;
  readonly keyArguments: {
    participantA: string[];
    participantB: string[];
  };
  readonly commonGround: string[];
  readonly unresolvedQuestions: string[];
  readonly blindSpots: string[];
  readonly createdAt: Date;

  private constructor(props: SummaryCardProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.keyArguments = {
      participantA: [...props.keyArguments.participantA],
      participantB: [...props.keyArguments.participantB],
    };
    this.commonGround = [...props.commonGround];
    this.unresolvedQuestions = [...props.unresolvedQuestions];
    this.blindSpots = [...props.blindSpots];
    this.createdAt = props.createdAt;
  }

  static create(props: SummaryCardProps): SummaryCard {
    return new SummaryCard(props);
  }
}
