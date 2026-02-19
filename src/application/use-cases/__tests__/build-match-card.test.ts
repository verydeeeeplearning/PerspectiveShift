import { describe, it, expect } from "vitest";
import { BuildMatchCardUseCase } from "../build-match-card";

describe("BuildMatchCardUseCase", () => {
  const uc = new BuildMatchCardUseCase();

  it("builds match card with distance label", () => {
    const result = uc.execute({
      distance: 0.35,
      topic: "AI 기술 규제",
      estimatedMinutes: 15,
    });

    expect(result.distanceLabel.level).toBe("MODERATE");
    expect(result.distanceLabel.emoji).toBeDefined();
    expect(result.topic).toBe("AI 기술 규제");
  });

  it("includes estimated time", () => {
    const result = uc.execute({
      distance: 0.5,
      topic: "소득 재분배",
      estimatedMinutes: 20,
    });

    expect(result.estimatedMinutes).toBe(20);
  });

  it("marks disabled when distance >= 0.8", () => {
    const result = uc.execute({
      distance: 0.85,
      topic: "기술 낙관",
      estimatedMinutes: 15,
    });

    expect(result.distanceLabel.isDisabled).toBe(true);
  });

  it("includes trailer when provided", () => {
    const result = uc.execute({
      distance: 0.4,
      topic: "일·생활 균형",
      estimatedMinutes: 15,
      trailerText: "기술에 열린 자세를 가진 분이에요.",
    });

    expect(result.trailer).toBe("기술에 열린 자세를 가진 분이에요.");
  });

  it("works without trailer", () => {
    const result = uc.execute({
      distance: 0.3,
      topic: "능력주의",
      estimatedMinutes: 10,
    });

    expect(result.trailer).toBeUndefined();
  });
});
