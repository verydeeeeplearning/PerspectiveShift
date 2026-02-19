import { describe, it, expect } from "vitest";
import { CommonGroundDiscovery } from "../common-ground-discovery";

describe("CommonGroundDiscovery", () => {
  it("creates with empty optional fields", () => {
    const cg = CommonGroundDiscovery.create({});
    expect(cg.mostConvincingPoint).toBeNull();
    expect(cg.nextQuestion).toBeNull();
  });

  it("accepts mostConvincingPoint", () => {
    const cg = CommonGroundDiscovery.create({
      mostConvincingPoint: "AI가 반복 노동을 줄여주는 건 맞다",
    });
    expect(cg.mostConvincingPoint).toContain("반복 노동");
  });

  it("accepts nextQuestion", () => {
    const cg = CommonGroundDiscovery.create({
      nextQuestion: "AI 교육 접근성에 대해 어떻게 생각하세요?",
    });
    expect(cg.nextQuestion).toContain("교육 접근성");
  });

  it("accepts both fields", () => {
    const cg = CommonGroundDiscovery.create({
      mostConvincingPoint: "설득력 있는 부분",
      nextQuestion: "다음 질문",
    });
    expect(cg.mostConvincingPoint).toBeTruthy();
    expect(cg.nextQuestion).toBeTruthy();
  });

  it("isEmpty returns true when both fields are null", () => {
    const cg = CommonGroundDiscovery.create({});
    expect(cg.isEmpty).toBe(true);
  });

  it("isEmpty returns false when at least one field exists", () => {
    const cg = CommonGroundDiscovery.create({ mostConvincingPoint: "something" });
    expect(cg.isEmpty).toBe(false);
  });

  it("trims whitespace from inputs", () => {
    const cg = CommonGroundDiscovery.create({
      mostConvincingPoint: "  공백 제거  ",
      nextQuestion: "  질문  ",
    });
    expect(cg.mostConvincingPoint).toBe("공백 제거");
    expect(cg.nextQuestion).toBe("질문");
  });
});
