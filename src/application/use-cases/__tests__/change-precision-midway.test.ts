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

  const rotating = Array.from({ length: 50 }, (_, index) =>
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
      currentPrecision: "lite",
      nextPrecision: "standard",
      activeQuestionIds: ["a1", "a2", "a3", "a4", "a5", "r1", "r2", "r3", "r4", "r5"],
      answeredCount: 5,
    });

    expect(result.precision).toBe("standard");
    expect(result.questionIds.length).toBeGreaterThanOrEqual(20);
    expect(result.answeredCount).toBe(5);
    expect(result.remainingCount).toBe(result.targetQuestionCount - 5);
  });

  it("truncates question IDs when precision decreases", async () => {
    const uc = new ChangePrecisionMidwayUseCase({
      questionBank: makeQuestionBank(),
    });

    const result = await uc.execute({
      currentPrecision: "deep",
      nextPrecision: "lite",
      activeQuestionIds: [
        "a1", "a2", "a3", "a4", "a5",
        "r1", "r2", "r3", "r4", "r5",
        "r6", "r7", "r8", "r9", "r10",
      ],
      answeredCount: 12,
    });

    expect(result.precision).toBe("lite");
    expect(result.questionIds).toHaveLength(10);
    expect(result.answeredCount).toBe(10);
    expect(result.isCompleted).toBe(true);
  });

  it("returns completed when answered count already covers new target", async () => {
    const uc = new ChangePrecisionMidwayUseCase({
      questionBank: makeQuestionBank(),
    });

    const result = await uc.execute({
      currentPrecision: "standard",
      nextPrecision: "lite",
      activeQuestionIds: [
        "a1", "a2", "a3", "a4", "a5",
        "r1", "r2", "r3", "r4", "r5",
        "r6", "r7", "r8", "r9", "r10",
        "r11", "r12", "r13", "r14", "r15",
      ],
      answeredCount: 15,
    });

    expect(result.isCompleted).toBe(true);
    expect(result.remainingCount).toBe(0);
  });
});
