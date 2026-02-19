import {
  AntiAbusePolicy,
  type RetakeCheckResult,
} from "@/domain/value-objects/anti-abuse-policy";

export class CheckRetakeLimitUseCase {
  private readonly policy: AntiAbusePolicy;

  constructor() {
    this.policy = AntiAbusePolicy.create();
  }

  execute(
    retakeCount: number,
    lastRetakeAt: Date | null,
  ): RetakeCheckResult {
    return this.policy.canRetake(retakeCount, lastRetakeAt);
  }
}
