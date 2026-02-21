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

  // 50 rotating
  for (let i = 0; i < 50; i++) {
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
  it("returns LITE mode questions (10)", async () => {
    const uc = new SelectOnboardingModeUseCase({ questionBank: makeBank() });
    const result = await uc.execute("LITE");

    expect(result.mode).toBe("LITE");
    expect(result.precisionLevel).toBe("lite");
    expect(result.questions).toHaveLength(10);
    expect(result.estimatedMinutes).toBe(3);
    expect(result.precision.displayText).toBeDefined();
  });

  it("returns STANDARD mode questions (20)", async () => {
    const uc = new SelectOnboardingModeUseCase({ questionBank: makeBank() });
    const result = await uc.execute("STANDARD");

    expect(result.mode).toBe("STANDARD");
    expect(result.precisionLevel).toBe("standard");
    expect(result.questions).toHaveLength(20);
    expect(result.estimatedMinutes).toBe(7);
  });

  it("returns DEEP mode questions (30)", async () => {
    const uc = new SelectOnboardingModeUseCase({ questionBank: makeBank() });
    const result = await uc.execute("DEEP");

    expect(result.mode).toBe("DEEP");
    expect(result.precisionLevel).toBe("deep");
    expect(result.questions).toHaveLength(30);
  });

  it("returns COMPREHENSIVE mode questions (50)", async () => {
    const uc = new SelectOnboardingModeUseCase({ questionBank: makeBank() });
    const result = await uc.execute("COMPREHENSIVE");

    expect(result.mode).toBe("COMPREHENSIVE");
    expect(result.precisionLevel).toBe("comprehensive");
    expect(result.questions).toHaveLength(50);
  });

  it("includes question metadata in output", async () => {
    const uc = new SelectOnboardingModeUseCase({ questionBank: makeBank() });
    const result = await uc.execute("LITE");
    const q = result.questions[0];

    expect(q.id).toBeDefined();
    expect(q.text).toBeDefined();
    expect(q.type).toBeDefined();
    expect(q.axis).toBeDefined();
    expect(typeof q.allowUncertain).toBe("boolean");
  });

  it("supports selecting by precision level", async () => {
    const uc = new SelectOnboardingModeUseCase({ questionBank: makeBank() });
    const result = await uc.executeByPrecision("deep");

    expect(result.mode).toBe("DEEP");
    expect(result.precisionLevel).toBe("deep");
    expect(result.questions).toHaveLength(30);
  });

  it("throws for invalid mode", async () => {
    const uc = new SelectOnboardingModeUseCase({ questionBank: makeBank() });
    await expect(uc.execute("INVALID" as never)).rejects.toThrow();
  });
});
