export interface FollowUpCheckinProps {
  id: string;
  dialogueSessionId: string;
  participantId: string;
  scheduledAt: Date;
  avoidanceReduction: number | null;
  completedAt: Date | null;
  createdAt: Date;
}

const EXPIRATION_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks

export class FollowUpCheckin {
  readonly id: string;
  readonly dialogueSessionId: string;
  readonly participantId: string;
  readonly scheduledAt: Date;
  readonly avoidanceReduction: number | null;
  readonly completedAt: Date | null;
  readonly createdAt: Date;

  private constructor(props: FollowUpCheckinProps) {
    this.id = props.id;
    this.dialogueSessionId = props.dialogueSessionId;
    this.participantId = props.participantId;
    this.scheduledAt = props.scheduledAt;
    this.avoidanceReduction = props.avoidanceReduction;
    this.completedAt = props.completedAt;
    this.createdAt = props.createdAt;
  }

  static create(props: FollowUpCheckinProps): FollowUpCheckin {
    return new FollowUpCheckin(props);
  }

  submit(avoidanceReduction: number): FollowUpCheckin {
    if (avoidanceReduction < 1 || avoidanceReduction > 5) {
      throw new Error(
        `Avoidance reduction must be between 1 and 5, got ${avoidanceReduction}`,
      );
    }
    return new FollowUpCheckin({
      id: this.id,
      dialogueSessionId: this.dialogueSessionId,
      participantId: this.participantId,
      scheduledAt: this.scheduledAt,
      avoidanceReduction,
      completedAt: new Date(),
      createdAt: this.createdAt,
    });
  }

  isExpired(now: Date): boolean {
    if (this.completedAt) return false;
    return now.getTime() - this.scheduledAt.getTime() >= EXPIRATION_MS;
  }

  isPending(now: Date): boolean {
    return !this.completedAt && !this.isExpired(now);
  }
}
