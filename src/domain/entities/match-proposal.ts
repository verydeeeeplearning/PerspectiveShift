import type { ProposalStatus } from "../value-objects/proposal-status";
import type { MatchScore } from "../value-objects/match-score";
import { ProposalAlreadyResolvedError } from "../errors/domain-errors";

export interface MatchProposalProps {
  id: string;
  initiatorSessionId: string;
  targetSessionId: string;
  score: MatchScore;
  status: ProposalStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class MatchProposal {
  readonly id: string;
  readonly initiatorSessionId: string;
  readonly targetSessionId: string;
  readonly score: MatchScore;
  private _status: ProposalStatus;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: MatchProposalProps) {
    this.id = props.id;
    this.initiatorSessionId = props.initiatorSessionId;
    this.targetSessionId = props.targetSessionId;
    this.score = props.score;
    this._status = props.status;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get status(): ProposalStatus {
    return this._status;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: MatchProposalProps): MatchProposal {
    return new MatchProposal(props);
  }

  accept(): void {
    this.ensurePending();
    this._status = "ACCEPTED";
    this._updatedAt = new Date();
  }

  reject(): void {
    this.ensurePending();
    this._status = "REJECTED";
    this._updatedAt = new Date();
  }

  expire(): void {
    this.ensurePending();
    this._status = "EXPIRED";
    this._updatedAt = new Date();
  }

  isExpired(now: Date = new Date()): boolean {
    return now >= this.expiresAt && this._status === "PENDING";
  }

  private ensurePending(): void {
    if (this._status !== "PENDING") {
      throw new ProposalAlreadyResolvedError(this.id, this._status);
    }
  }
}
