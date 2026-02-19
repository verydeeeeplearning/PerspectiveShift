import type { JitaiSignal } from "./jitai-signal";
import type { JitaiAction } from "./intervention-action";

export type JitaiRuleId =
  | "FATIGUE"
  | "BLANK_FEAR"
  | "TENSION"
  | "DISTRESS"
  | "LOW_LISTENING";

export type JitaiCondition = (signal: JitaiSignal) => boolean;

export class JitaiRule {
  readonly id: JitaiRuleId;
  readonly condition: JitaiCondition;
  readonly actions: readonly JitaiAction[];

  constructor(
    id: JitaiRuleId,
    condition: JitaiCondition,
    actions: readonly JitaiAction[],
  ) {
    this.id = id;
    this.condition = condition;
    this.actions = actions;
  }

  evaluate(signal: JitaiSignal): JitaiAction[] {
    if (!this.condition(signal)) {
      return [];
    }
    return [...this.actions];
  }
}
