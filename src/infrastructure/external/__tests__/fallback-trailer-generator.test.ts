import { describe, it, expect } from "vitest";
import { FallbackTrailerGenerator } from "../fallback-trailer-generator";
import { StanceVector } from "@/domain/entities/stance-vector";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

const BANNED_LABELS = ["진보", "보수", "좌파", "우파", "좌익", "우익"];

function makeVector(overrides: Partial<Record<StanceDimension, number>> = {}) {
  return StanceVector.fromValues({
    TECH_REGULATION: 0,
    REDISTRIBUTION: 0,
    WORK_LIFE: 0,
    MERITOCRACY: 0,
    TECH_OPTIMISM: 0,
    OPPORTUNITY_EQUALITY: 0,
    ...overrides,
  } as Record<StanceDimension, number>);
}

describe("FallbackTrailerGenerator", () => {
  const generator = new FallbackTrailerGenerator();

  it("generates valid trailer text", async () => {
    const opponent = makeVector({ TECH_REGULATION: 0.8, REDISTRIBUTION: 0.1 });
    const my = makeVector({ TECH_REGULATION: -0.3, REDISTRIBUTION: 0.0 });

    const trailer = await generator.generate(opponent, my, "AI 규제");

    expect(trailer).toBeDefined();
    expect(trailer.text).toBeTruthy();
    expect(trailer.text.length).toBeLessThanOrEqual(80);
  });

  it("contains no banned labels", async () => {
    const opponent = makeVector({ REDISTRIBUTION: 0.9 });
    const my = makeVector({ REDISTRIBUTION: -0.8 });

    const trailer = await generator.generate(opponent, my, "소득 재분배");

    for (const label of BANNED_LABELS) {
      expect(trailer.text).not.toContain(label);
    }
  });

  it("produces 2-3 lines", async () => {
    const opponent = makeVector({ TECH_REGULATION: 0.8 });
    const my = makeVector({ TECH_REGULATION: -0.5 });

    const trailer = await generator.generate(opponent, my, "AI 규제");
    const lines = trailer.text.split("\n").filter(Boolean);

    expect(lines.length).toBeGreaterThanOrEqual(2);
    expect(lines.length).toBeLessThanOrEqual(3);
  });

  it("produces 3 lines when max diff > 0.5", async () => {
    const opponent = makeVector({ TECH_REGULATION: 0.8 });
    const my = makeVector({ TECH_REGULATION: -0.5 });

    const trailer = await generator.generate(opponent, my, "AI 규제");
    const lines = trailer.text.split("\n").filter(Boolean);

    // diff = 1.3, which is > 0.5 => 3 lines
    expect(lines.length).toBe(3);
  });

  it("produces 2 lines when max diff <= 0.5", async () => {
    const opponent = makeVector({ TECH_REGULATION: 0.2 });
    const my = makeVector({ TECH_REGULATION: 0.0 });

    const trailer = await generator.generate(opponent, my, "기술 규제");
    const lines = trailer.text.split("\n").filter(Boolean);

    // diff = 0.2, which is <= 0.5 => 2 lines
    expect(lines.length).toBe(2);
  });

  it("different stances produce different trailers", async () => {
    const my = makeVector();

    const opponent1 = makeVector({ TECH_REGULATION: 0.9, REDISTRIBUTION: 0.1 });
    const opponent2 = makeVector({ TECH_REGULATION: 0.1, WORK_LIFE: 0.9 });

    const trailer1 = await generator.generate(opponent1, my, "주제");
    const trailer2 = await generator.generate(opponent2, my, "주제");

    expect(trailer1.text).not.toBe(trailer2.text);
  });

  it("identifies the largest difference dimension correctly", async () => {
    // REDISTRIBUTION has the largest diff (0.9 - (-0.5) = 1.4)
    const opponent = makeVector({
      TECH_REGULATION: 0.2,
      REDISTRIBUTION: 0.9,
      WORK_LIFE: 0.1,
    });
    const my = makeVector({
      TECH_REGULATION: 0.0,
      REDISTRIBUTION: -0.5,
      WORK_LIFE: 0.0,
    });

    const trailer = await generator.generate(opponent, my, "경제");

    // The trailer should reference "소득 재분배" (REDISTRIBUTION label)
    expect(trailer.text).toContain("소득 재분배");
  });
});
