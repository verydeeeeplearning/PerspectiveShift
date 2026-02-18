import type { OpinionDistance } from "../value-objects/opinion-distance";
import type { ReadinessScore } from "../value-objects/readiness-score";
import type { MatchScore } from "../value-objects/match-score";

export interface MatchCandidateProps {
  sessionId: string;
  distance: OpinionDistance;
  readiness: ReadinessScore;
  score: MatchScore;
}

export class MatchCandidate {
  readonly sessionId: string;
  readonly distance: OpinionDistance;
  readonly readiness: ReadinessScore;
  readonly score: MatchScore;

  private constructor(props: MatchCandidateProps) {
    this.sessionId = props.sessionId;
    this.distance = props.distance;
    this.readiness = props.readiness;
    this.score = props.score;
  }

  static create(props: MatchCandidateProps): MatchCandidate {
    return new MatchCandidate(props);
  }

  isInSweetSpot(): boolean {
    return this.distance.isInSweetSpot();
  }
}
