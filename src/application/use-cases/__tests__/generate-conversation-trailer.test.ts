import { describe, it, expect, vi } from "vitest";
import { GenerateConversationTrailerUseCase } from "../generate-conversation-trailer";
import type { TrailerGenerator } from "@/domain/interfaces/trailer-generator";
import { StanceVector } from "@/domain/entities/stance-vector";
import { ConversationTrailer } from "@/domain/value-objects/conversation-trailer";

function makeVector(overrides: Partial<Record<string, number>> = {}) {
  return StanceVector.fromValues({
    TECH_REGULATION: 0,
    REDISTRIBUTION: 0,
    WORK_LIFE: 0,
    MERITOCRACY: 0,
    TECH_OPTIMISM: 0,
    OPPORTUNITY_EQUALITY: 0,
    ...overrides,
  } as Record<"TECH_REGULATION" | "REDISTRIBUTION" | "WORK_LIFE" | "MERITOCRACY" | "TECH_OPTIMISM" | "OPPORTUNITY_EQUALITY", number>);
}

describe("GenerateConversationTrailerUseCase", () => {
  function makeMockGenerator(text: string): TrailerGenerator {
    return {
      generate: vi.fn().mockResolvedValue(ConversationTrailer.create(text)),
    };
  }

  it("returns 2 lines when trailer has 2 lines", async () => {
    const gen = makeMockGenerator("첫 번째 줄입니다.\n두 번째 줄입니다.");
    const uc = new GenerateConversationTrailerUseCase({ trailerGenerator: gen });

    const result = await uc.execute({
      opponentStance: makeVector({ TECH_REGULATION: 0.8 }),
      myStance: makeVector({ TECH_REGULATION: -0.3 }),
      topic: "AI 규제",
    });

    expect(result.line1).toBe("첫 번째 줄입니다.");
    expect(result.line2).toBe("두 번째 줄입니다.");
    expect(result.line3).toBeNull();
  });

  it("returns 3 lines when trailer has 3 lines", async () => {
    const gen = makeMockGenerator("줄 하나.\n줄 둘.\n줄 셋.");
    const uc = new GenerateConversationTrailerUseCase({ trailerGenerator: gen });

    const result = await uc.execute({
      opponentStance: makeVector({ REDISTRIBUTION: 0.9 }),
      myStance: makeVector({ REDISTRIBUTION: -0.5 }),
      topic: "소득 재분배",
    });

    expect(result.line1).toBe("줄 하나.");
    expect(result.line2).toBe("줄 둘.");
    expect(result.line3).toBe("줄 셋.");
  });

  it("line3 is null when trailer has only 2 lines", async () => {
    const gen = makeMockGenerator("A line.\nB line.");
    const uc = new GenerateConversationTrailerUseCase({ trailerGenerator: gen });

    const result = await uc.execute({
      opponentStance: makeVector(),
      myStance: makeVector(),
      topic: "테스트",
    });

    expect(result.line3).toBeNull();
  });

  it("calls trailerGenerator.generate with correct arguments", async () => {
    const gen = makeMockGenerator("라인1.\n라인2.");
    const uc = new GenerateConversationTrailerUseCase({ trailerGenerator: gen });

    const opponent = makeVector({ TECH_OPTIMISM: 0.7 });
    const my = makeVector({ TECH_OPTIMISM: -0.2 });

    await uc.execute({
      opponentStance: opponent,
      myStance: my,
      topic: "기술 낙관주의",
    });

    expect(gen.generate).toHaveBeenCalledOnce();
    expect(gen.generate).toHaveBeenCalledWith(opponent, my, "기술 낙관주의");
  });

  it("trims whitespace from parsed lines", async () => {
    const gen = makeMockGenerator("  공백 앞뒤  \n  두번째  ");
    const uc = new GenerateConversationTrailerUseCase({ trailerGenerator: gen });

    const result = await uc.execute({
      opponentStance: makeVector(),
      myStance: makeVector(),
      topic: "테스트",
    });

    expect(result.line1).toBe("공백 앞뒤");
    expect(result.line2).toBe("두번째");
  });

  it("skips empty lines when parsing", async () => {
    const gen = makeMockGenerator("첫줄.\n\n둘째줄.");
    const uc = new GenerateConversationTrailerUseCase({ trailerGenerator: gen });

    const result = await uc.execute({
      opponentStance: makeVector(),
      myStance: makeVector(),
      topic: "테스트",
    });

    expect(result.line1).toBe("첫줄.");
    expect(result.line2).toBe("둘째줄.");
    expect(result.line3).toBeNull();
  });
});
