import { describe, it, expect } from "vitest";
import { StartDynamicOnboardingUseCase } from "../start-dynamic-onboarding";
import { QuestionItem } from "@/domain/value-objects/question-item";
import { QuestionBank } from "@/domain/entities/question-bank";

function makeBank(): QuestionBank {
  const axes = [
    "TECH_REGULATION",
    "REDISTRIBUTION",
    "WORK_LIFE",
    "MERITOCRACY",
    "TECH_OPTIMISM",
    "OPPORTUNITY_EQUALITY",
  ] as const;

  const questions: QuestionItem[] = [];
  for (let i = 0; i < 10; i++) {
    questions.push(
      QuestionItem.create({
        id: `${i + 1}`,
        text: `Question ${i + 1}`,
        type: i % 2 === 0 ? "OX" : "RUBRIC",
        axis: axes[i % axes.length],
        isAnchor: i < 5,
      }),
    );
  }
  // Add some rotating for larger pools
  for (let i = 10; i < 50; i++) {
    questions.push(
      QuestionItem.create({
        id: `${i + 1}`,
        text: `Rotating ${i + 1}`,
        type: "OX",
        axis: axes[i % axes.length],
        isAnchor: false,
      }),
    );
  }

  return QuestionBank.create(questions);
}

describe("StartDynamicOnboardingUseCase", () => {
  it("returns 10 seed questions for lite tier", () => {
    const uc = new StartDynamicOnboardingUseCase({ questionBank: makeBank() });
    const result = uc.execute("lite");

    expect(result.precision).toBe("lite");
    expect(result.seedQuestions).toHaveLength(10);
    expect(result.targetTotal).toBe(10);
    expect(result.bank.isComplete()).toBe(true); // 10 seed = 10 target
  });

  it("returns 10 seed questions for standard tier with 20 target", () => {
    const uc = new StartDynamicOnboardingUseCase({ questionBank: makeBank() });
    const result = uc.execute("standard");

    expect(result.precision).toBe("standard");
    expect(result.seedQuestions).toHaveLength(10);
    expect(result.targetTotal).toBe(20);
    expect(result.bank.isComplete()).toBe(false);
    expect(result.bank.remainingCount).toBe(10);
  });

  it("returns 10 seed questions for deep tier with 30 target", () => {
    const uc = new StartDynamicOnboardingUseCase({ questionBank: makeBank() });
    const result = uc.execute("deep");

    expect(result.targetTotal).toBe(30);
    expect(result.bank.remainingCount).toBe(20);
  });

  it("returns 10 seed questions for comprehensive tier with 50 target", () => {
    const uc = new StartDynamicOnboardingUseCase({ questionBank: makeBank() });
    const result = uc.execute("comprehensive");

    expect(result.targetTotal).toBe(50);
    expect(result.bank.remainingCount).toBe(40);
  });

  it("seed questions have proper structure", () => {
    const uc = new StartDynamicOnboardingUseCase({ questionBank: makeBank() });
    const result = uc.execute("standard");

    for (const seed of result.seedQuestions) {
      expect(seed.id).toBeGreaterThanOrEqual(1);
      expect(seed.text).toBeTruthy();
      expect(seed.type).toBeTruthy();
      expect(seed.dimension).toBeTruthy();
      expect([-1, 1]).toContain(seed.polarity);
    }
  });
});
