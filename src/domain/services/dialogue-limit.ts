import { CooldownMode } from "../value-objects/cooldown-mode";

export interface DialogueLimitResult {
  allowed: boolean;
  remaining: number;
  cooldown?: CooldownMode;
}

export class DialogueLimit {
  static readonly MAX_DAILY = 2;

  static check(todayCount: number): DialogueLimitResult {
    const remaining = Math.max(0, this.MAX_DAILY - todayCount);

    if (todayCount >= this.MAX_DAILY) {
      return {
        allowed: false,
        remaining: 0,
        cooldown: CooldownMode.activate("DAILY_LIMIT"),
      };
    }

    return { allowed: true, remaining };
  }
}
