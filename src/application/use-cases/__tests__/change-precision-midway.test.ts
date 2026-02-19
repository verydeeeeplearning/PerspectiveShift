import { describe, it, expect } from "vitest";
import { QuestionItem } from "@/domain/value-objects/question-item";
import { QuestionBank } from "@/domain/entities/question-bank";
import { ChangePrecisionMidwayUseCase } from "../change-precision-midway";

function makeQuestionBank(): QuestionBank {
  const axes = [
    "TECH_REGULATION",
    "REDISTRIBUTION",
    "WORK_LIFE",
    "MERITOCRACY",
    "TECH_OPTIMISM",
    "OPPORTUNITY_EQUALITY",
  ] as const;
  const anchors = Array.from({ length: 5 }, (_, index) =>
    QuestionItem.create({
      id: `a${index + 1}`,
      text: `Anchor ${index + 1}`,
      type: "OX",
      axis: axes[index % axes.length],
      isAnchor: true,
    }),
  );

  const rotating = Array.from({ length: 20 }, (_, index) =>
    QuestionItem.create({
      id: `r${index + 1}`,
      text: `Rotating ${index + 1}`,
      type: "OX",
      axis: axes[index % axes.length],
      isAnchor: false,
    }),
  );

  return QuestionBank.create([...anchors, ...rotating]);
}

describe("ChangePrecisionMidwayUseCase", () => {
  it("extends question IDs when precision increases", async () => {
    const uc = new ChangePrecisionMidwayUseCase({
      questionBank: makeQuestionBank(),
    });

    const result = await uc.execute({
      currentPrecision: "quick",
      nextPrecision: "standard",
      activeQuestionIds: ["a1", "a2", "a3", "a4", "a5"],
      answeredCount: 3,
    });

    expect(result.precision).toBe("standard");
    expect(result.questionIds.length).toBeGreaterThanOrEqual(10);
    expect(result.answeredCount).toBe(3);
    expect(result.remainingCount).toBe(result.targetQuestionCount - 3);
  });

  it("truncates question IDs when precision decreases", async () => {
    const uc = new ChangePrecisionMidwayUseCase({
      questionBank: makeQuestionBank(),
    });

    const result = await uc.execute({
      currentPrecision: "detailed",
      nextPrecision: "quick",
      activeQuestionIds: [
        "a1",
        "a2",
        "a3",
        "a4",
        "a5",
        "r1",
        "r2",
        "r3",
        "r4",
        "r5",
      ],
      answeredCount: 6,
    });

    expect(result.precision).toBe("quick");
    expect(result.questionIds).toHaveLength(5);
    expect(result.answeredCount).toBe(5);
    expect(result.isCompleted).toBe(true);
  });

  it("returns completed when answered count already covers new target", async () => {
    const uc = new ChangePrecisionMidwayUseCase({
      questionBank: makeQuestionBank(),
    });

    const result = await uc.execute({
      currentPrecision: "standard",
      nextPrecision: "quick",
      activeQuestionIds: ["a1", "a2", "a3", "a4", "a5", "r1"],
      answeredCount: 5,
    });

    expect(result.isCompleted).toBe(true);
    expect(result.remainingCount).toBe(0);
  });
});
