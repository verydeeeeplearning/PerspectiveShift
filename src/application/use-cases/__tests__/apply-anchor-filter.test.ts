import { describe, expect, it } from "vitest";
import { ApplyAnchorFilterUseCase } from "../apply-anchor-filter";

describe("ApplyAnchorFilterUseCase", () => {
  const uc = new ApplyAnchorFilterUseCase();

  it("applies anchor match + difference range filter", () => {
    const result = uc.execute({
      anchorType: "age_group",
      anchorValue: "30대",
      differenceLevel: 0,
      energyLevel: "HIGH",
      candidates: [
        {
          userId: "u1",
          attributes: [{ type: "age_group", value: "30대" }],
          stanceDistance: 0.15,
        },
        {
          userId: "u2",
          attributes: [{ type: "age_group", value: "30대" }],
          stanceDistance: 0.65,
        },
        {
          userId: "u3",
          attributes: [{ type: "age_group", value: "40대" }],
          stanceDistance: 0.15,
        },
      ],
    });

    expect(result.filtered.map((c) => c.userId)).toEqual(["u1"]);
    expect(result.appliedRange).toEqual({ min: 0, max: 0.2 });
  });

  it("caps maximum difference by LOW energy (max 0.4)", () => {
    const result = uc.execute({
      anchorType: "job_category",
      anchorValue: "학생",
      differenceLevel: 1,
      energyLevel: "LOW",
      candidates: [
        {
          userId: "low-ok",
          attributes: [{ type: "job_category", value: "학생" }],
          stanceDistance: 0.35,
        },
        {
          userId: "low-over",
          attributes: [{ type: "job_category", value: "학생" }],
          stanceDistance: 0.55,
        },
      ],
    });

    expect(result.appliedRange.max).toBe(0.4);
    expect(result.filtered.map((c) => c.userId)).toEqual(["low-ok"]);
  });

  it("caps maximum difference by NORMAL energy (max 0.7)", () => {
    const result = uc.execute({
      anchorType: "job_category",
      anchorValue: "학생",
      differenceLevel: 1,
      energyLevel: "NORMAL",
      candidates: [
        {
          userId: "normal-ok",
          attributes: [{ type: "job_category", value: "학생" }],
          stanceDistance: 0.68,
        },
        {
          userId: "normal-over",
          attributes: [{ type: "job_category", value: "학생" }],
          stanceDistance: 0.9,
        },
      ],
    });

    expect(result.appliedRange.max).toBe(0.7);
    expect(result.filtered.map((c) => c.userId)).toEqual(["normal-ok"]);
  });
});
