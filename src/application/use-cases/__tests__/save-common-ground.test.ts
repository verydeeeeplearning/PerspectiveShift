import { describe, it, expect } from "vitest";
import { SaveCommonGroundUseCase } from "../save-common-ground";

describe("SaveCommonGroundUseCase", () => {
  const uc = new SaveCommonGroundUseCase();

  it("saves common ground with both fields", () => {
    const result = uc.execute({
      mostConvincingPoint: "반복 노동 줄여주는 건 맞다",
      nextQuestion: "교육 접근성에 대해",
    });
    expect(result.mostConvincingPoint).toContain("반복 노동");
    expect(result.nextQuestion).toContain("교육 접근성");
  });

  it("allows empty (optional) fields", () => {
    const result = uc.execute({});
    expect(result.isEmpty).toBe(true);
  });

  it("trims input text", () => {
    const result = uc.execute({ mostConvincingPoint: "  text  " });
    expect(result.mostConvincingPoint).toBe("text");
  });
});
