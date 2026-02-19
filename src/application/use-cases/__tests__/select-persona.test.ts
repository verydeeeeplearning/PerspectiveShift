import { describe, it, expect, vi } from "vitest";
import { SelectPersonaUseCase } from "../select-persona";
import type { PersonaRepository } from "@/domain/interfaces/persona-repository";
import { PersonaProfile } from "@/domain/entities/persona-profile";
import { StanceVector } from "@/domain/entities/stance-vector";

function makePersona() {
  return PersonaProfile.create({
    id: "persona-1",
    name: "현실주의 직장인",
    ageGroup: "30대",
    jobCategory: "IT직군",
    stanceLabel: "경제 보수",
    description: "실용적 관점에서 경제 정책을 바라봅니다.",
    conversationStyle: "logical",
    stanceVector: StanceVector.fromValues({
      TECH_REGULATION: -0.3,
      REDISTRIBUTION: -0.5,
      WORK_LIFE: -0.2,
      MERITOCRACY: 0.7,
      TECH_OPTIMISM: 0.6,
      OPPORTUNITY_EQUALITY: -0.3,
    }),
    experienceBank: ["IT 업계에서 10년째 일하고 있습니다."],
  });
}

describe("SelectPersonaUseCase", () => {
  it("returns persona output when found", async () => {
    const persona = makePersona();
    const repo: PersonaRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(persona),
    };
    const uc = new SelectPersonaUseCase(repo);

    const result = await uc.execute({ personaId: "persona-1" });

    expect(result.id).toBe("persona-1");
    expect(result.name).toBe("현실주의 직장인");
    expect(result.ageGroup).toBe("30대");
    expect(result.jobCategory).toBe("IT직군");
    expect(result.stanceLabel).toBe("경제 보수");
    expect(result.description).toBe("실용적 관점에서 경제 정책을 바라봅니다.");
    expect(result.conversationStyle).toBe("logical");
  });

  it("throws when persona not found", async () => {
    const repo: PersonaRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    };
    const uc = new SelectPersonaUseCase(repo);

    await expect(uc.execute({ personaId: "unknown" })).rejects.toThrow(
      "Persona not found: unknown",
    );
  });
});
