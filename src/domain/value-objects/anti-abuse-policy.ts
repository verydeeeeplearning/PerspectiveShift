export interface RetakeCheckResult {
  allowed: boolean;
  message?: string;
  warning?: string;
}

const DAILY_RETAKE_LIMIT = 1;
const EXCESSIVE_RETAKE_THRESHOLD = 3;

export class AntiAbusePolicy {
  readonly dailyRetakeLimit: number;

  private constructor() {
    this.dailyRetakeLimit = DAILY_RETAKE_LIMIT;
  }

  static create(): AntiAbusePolicy {
    return new AntiAbusePolicy();
  }

  canRetake(
    retakeCountToday: number,
    lastRetakeAt: Date | null,
    now: Date = new Date(),
  ): RetakeCheckResult {
    const sameDay =
      lastRetakeAt !== null && this.isSameCalendarDay(lastRetakeAt, now);

    if (sameDay && retakeCountToday >= this.dailyRetakeLimit) {
      return {
        allowed: false,
        message: "오늘은 이미 다시 풀어보셨어요. 내일 다시 해볼까요?",
      };
    }

    const result: RetakeCheckResult = { allowed: true };

    if (retakeCountToday >= EXCESSIVE_RETAKE_THRESHOLD) {
      result.warning =
        "여러 번 다시 풀어보셨네요. 결과가 크게 달라지지 않을 수 있어요.";
    }

    return result;
  }

  private isSameCalendarDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
