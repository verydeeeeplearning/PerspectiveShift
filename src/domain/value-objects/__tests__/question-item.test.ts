import { describe, it, expect } from "vitest";
import { QuestionItem } from "../question-item";

describe("QuestionItem", () => {
  it("creates an anchor question", () => {
    const q = QuestionItem.create({
      id: "q1",
      text: "AI가 만든 콘텐츠에는 반드시 AI 생성 라벨을 붙여야 한다",
      type: "OX",
      axis: "TECH_REGULATION",
      isAnchor: true,
    });

    expect(q.id).toBe("q1");
    expect(q.type).toBe("OX");
    expect(q.axis).toBe("TECH_REGULATION");
    expect(q.isAnchor).toBe(true);
  });

  it("creates a rotating question with variant", () => {
    const q = QuestionItem.create({
      id: "q-r-1",
      text: "AI 챗봇이 의료 상담을 하는 것이 허용되어야 한다",
      type: "OX",
      axis: "TECH_REGULATION",
      isAnchor: false,
      variant: "A",
      allowUncertain: true,
      tooltipText: "응답 성향 확인용 문항",
    });

    expect(q.isAnchor).toBe(false);
    expect(q.variant).toBe("A");
    expect(q.allowUncertain).toBe(true);
    expect(q.tooltipText).toBe("응답 성향 확인용 문항");
  });

  it("defaults variant to undefined for anchor questions", () => {
    const q = QuestionItem.create({
      id: "q1",
      text: "test",
      type: "OX",
      axis: "TECH_REGULATION",
      isAnchor: true,
    });

    expect(q.variant).toBeUndefined();
    expect(q.allowUncertain).toBe(false);
    expect(q.tooltipText).toBeUndefined();
  });

  it("throws for empty text", () => {
    expect(() =>
      QuestionItem.create({
        id: "q1",
        text: "",
        type: "OX",
        axis: "TECH_REGULATION",
        isAnchor: true,
      }),
    ).toThrow("Question text cannot be empty");
  });

  it("throws for empty id", () => {
    expect(() =>
      QuestionItem.create({
        id: "",
        text: "test",
        type: "OX",
        axis: "TECH_REGULATION",
        isAnchor: true,
      }),
    ).toThrow("Question ID cannot be empty");
  });
});
