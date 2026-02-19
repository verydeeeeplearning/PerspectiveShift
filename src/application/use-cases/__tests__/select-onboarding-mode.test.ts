import { describe, it, expect } from "vitest";
import { SelectOnboardingModeUseCase } from "../select-onboarding-mode";
import { QuestionItem } from "@/domain/value-objects/question-item";
import { QuestionBank } from "@/domain/entities/question-bank";

function makeBank(): QuestionBank {
  const questions: QuestionItem[] = [];
  const axes = [
    "TECH_REGULATION",
    "REDISTRIBUTION",
    "WORK_LIFE",
    "MERITOCRACY",
    "TECH_OPTIMISM",
    "OPPORTUNITY_EQUALITY",
  ] as const;

  // 7 anchors
  for (let i = 0; i < 7; i++) {
    questions.push(
      QuestionItem.create({
        id: `a${i + 1}`,
        text: `Anchor ${i + 1}`,
        type: "OX",
        axis: axes[i % axes.length],
        isAnchor: true,
        allowUncertain: i % 2 === 0,
        tooltipText: i === 0 ? "핵심 문항" : undefined,
      }),
    );
  }

  // 30 rotating
  for (let i = 0; i < 30; i++) {
    questions.push(
      QuestionItem.create({
        id: `r${i + 1}`,
        text: `Rotating ${i + 1}`,
        type: "OX",
        axis: axes[i % axes.length],
        isAnchor: false,
        variant: `V${i % 3}`,
        allowUncertain: false,
      }),
    );
  }

  return QuestionBank.create(questions);
}

describe("SelectOnboardingModeUseCase", () => {
  it("returns QUICK mode questions (5)", async () => {
    const uc = new SelectOnboardingModeUseCase({ questionBank: makeBank() });
    const result = await uc.execute("QUICK");

    expect(result.mode).toBe("QUICK");
    expect(result.precisionLevel).toBe("quick");
    expect(result.questions).toHaveLength(5);
    expect(result.estimatedMinutes).toBe(2);
    expect(result.precision.displayText).toBeDefined();
  });

  it("returns STANDARD mode questions (10)", async () => {
    const uc = new SelectOnboardingModeUseCase({ questionBank: makeBank() });
    const result = await uc.execute("STANDARD");

    expect(result.mode).toBe("STANDARD");
    expect(result.precisionLevel).toBe("standard");
    expect(result.questions).toHaveLength(10);
    expect(result.estimatedMinutes).toBe(4);
  });

  it("returns PRECISE mode questions (20)", async () => {
    const uc = new SelectOnboardingModeUseCase({ questionBank: makeBank() });
    const result = await uc.execute("PRECISE");

    expect(result.mode).toBe("PRECISE");
    expect(result.precisionLevel).toBe("detailed");
    expect(result.questions).toHaveLength(20);
  });

  it("includes question metadata in output", async () => {
    const uc = new SelectOnboardingModeUseCase({ questionBank: makeBank() });
    const result = await uc.execute("QUICK");
    const q = result.questions[0];

    expect(q.id).toBeDefined();
    expect(q.text).toBeDefined();
    expect(q.type).toBeDefined();
    expect(q.axis).toBeDefined();
    expect(typeof q.allowUncertain).toBe("boolean");
  });

  it("supports selecting by precision level", async () => {
    const uc = new SelectOnboardingModeUseCase({ questionBank: makeBank() });
    const result = await uc.executeByPrecision("detailed");

    expect(result.mode).toBe("PRECISE");
    expect(result.precisionLevel).toBe("detailed");
    expect(result.questions).toHaveLength(20);
  });

  it("throws for invalid mode", async () => {
    const uc = new SelectOnboardingModeUseCase({ questionBank: makeBank() });
    await expect(uc.execute("INVALID" as never)).rejects.toThrow();
  });
});
