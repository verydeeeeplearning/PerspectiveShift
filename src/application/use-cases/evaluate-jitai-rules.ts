import type { JitaiAction } from "@/domain/value-objects/intervention-action";
import type { JitaiRuleId } from "@/domain/value-objects/jitai-rule";
import { JitaiRule } from "@/domain/value-objects/jitai-rule";
import {
  normalizeJitaiSignal,
  type JitaiSignal,
} from "@/domain/value-objects/jitai-signal";

const RULE_PRIORITY: JitaiRuleId[] = [
  "DISTRESS",
  "FATIGUE",
  "TENSION",
  "BLANK_FEAR",
  "LOW_LISTENING",
];

const RULES: Record<JitaiRuleId, JitaiRule> = {
  DISTRESS: new JitaiRule(
    "DISTRESS",
    (signal) => signal.hasReport || signal.feelHeardScore < 2,
    [
      {
        type: "break_suggest",
        reason: "distress_signal",
      },
      {
        type: "recovery",
        reason: "distress_signal",
      },
    ],
  ),
  FATIGUE: new JitaiRule(
    "FATIGUE",
    (signal) => signal.energy < 30,
    [
      {
        type: "downshift",
        reason: "low_energy",
        params: {
          topicLevelDelta: -1,
          facilitatorIntensity: 1,
        },
      },
    ],
  ),
  TENSION: new JitaiRule(
    "TENSION",
    (signal) => signal.consecutiveToneChecks >= 2,
    [
      {
        type: "recovery",
        reason: "repeated_tone_checks",
      },
    ],
  ),
  BLANK_FEAR: new JitaiRule(
    "BLANK_FEAR",
    (signal) => signal.idleSeconds >= 90 && signal.deleteCount >= 2,
    [
      {
        type: "coach_highlight",
        reason: "idle_with_rewrites",
      },
    ],
  ),
  LOW_LISTENING: new JitaiRule(
    "LOW_LISTENING",
    (signal) => signal.highlightCount === 0 && signal.quoteCount === 0,
    [
      {
        type: "nudge_highlight",
        reason: "missing_highlight_and_quote",
      },
    ],
  ),
};

export class EvaluateJitaiRulesUseCase {
  execute(input: JitaiSignal): JitaiAction[] {
    const signal = normalizeJitaiSignal(input);
    const actions: JitaiAction[] = [];

    for (const ruleId of RULE_PRIORITY) {
      actions.push(...RULES[ruleId].evaluate(signal));
    }

    return actions;
  }
}
