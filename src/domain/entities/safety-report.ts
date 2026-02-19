import type { SafetyReason } from "../value-objects/safety-reason";
import type { SafetyReportStatus } from "../value-objects/safety-report-status";

export interface SafetyReportProps {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: SafetyReason;
  description: string | null;
  status: SafetyReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class SafetyReport {
  readonly id: string;
  readonly reporterId: string;
  readonly reportedId: string;
  readonly reason: SafetyReason;
  readonly description: string | null;
  private _status: SafetyReportStatus;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: SafetyReportProps) {
    this.id = props.id;
    this.reporterId = props.reporterId;
    this.reportedId = props.reportedId;
    this.reason = props.reason;
    this.description = props.description;
    this._status = props.status;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get status(): SafetyReportStatus {
    return this._status;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: SafetyReportProps): SafetyReport {
    return new SafetyReport(props);
  }

  markReviewing(): void {
    this._status = "REVIEWING";
    this._updatedAt = new Date();
  }

  resolve(): void {
    this._status = "RESOLVED";
    this._updatedAt = new Date();
  }

  dismiss(): void {
    this._status = "DISMISSED";
    this._updatedAt = new Date();
  }
}
