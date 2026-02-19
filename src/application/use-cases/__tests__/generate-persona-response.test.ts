import { describe, it, expect, vi } from "vitest";
import { GeneratePersonaResponseUseCase } from "../generate-persona-response";
import type { PersonaRepository } from "@/domain/interfaces/persona-repository";
import type { PersonaDialogueGenerator } from "@/domain/interfaces/persona-dialogue-generator";
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

describe("GeneratePersonaResponseUseCase", () => {
  it("returns response and delay when persona found", async () => {
    const persona = makePersona();
    const mockResponse = "이 문제에 대해 저는 다른 관점을 가지고 있습니다. 경제적 효율성을 고려하면...";
    const personaRepository: PersonaRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(persona),
    };
    const personaDialogueGenerator: PersonaDialogueGenerator = {
      generateResponse: vi.fn().mockResolvedValue(mockResponse),
    };
    const uc = new GeneratePersonaResponseUseCase({
      personaRepository,
      personaDialogueGenerator,
    });

    const result = await uc.execute({
      personaId: "persona-1",
      userMessage: "경제 정책에 대해 어떻게 생각하세요?",
      topic: "경제 정책",
      conversationHistory: [],
    });

    expect(result.response).toBe(mockResponse);
    expect(result.delayMs).toBeGreaterThanOrEqual(2000);
    expect(result.delayMs).toBeLessThanOrEqual(17000);
  });

  it("throws when persona not found", async () => {
    const personaRepository: PersonaRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    };
    const personaDialogueGenerator: PersonaDialogueGenerator = {
      generateResponse: vi.fn(),
    };
    const uc = new GeneratePersonaResponseUseCase({
      personaRepository,
      personaDialogueGenerator,
    });

    await expect(
      uc.execute({
        personaId: "unknown",
        userMessage: "안녕하세요",
        topic: "경제",
        conversationHistory: [],
      }),
    ).rejects.toThrow("Persona not found: unknown");
  });

  it("passes correct arguments to dialogue generator", async () => {
    const persona = makePersona();
    const personaRepository: PersonaRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(persona),
    };
    const generateResponse = vi.fn().mockResolvedValue("응답입니다.");
    const personaDialogueGenerator: PersonaDialogueGenerator = {
      generateResponse,
    };
    const uc = new GeneratePersonaResponseUseCase({
      personaRepository,
      personaDialogueGenerator,
    });

    const history = [{ role: "user" as const, content: "안녕하세요" }];
    await uc.execute({
      personaId: "persona-1",
      userMessage: "경제에 대해 어떻게 생각하세요?",
      topic: "경제",
      conversationHistory: history,
    });

    expect(generateResponse).toHaveBeenCalledWith(
      persona,
      history,
      "경제에 대해 어떻게 생각하세요?",
      "경제",
      undefined,
    );
  });

  it("delay is reasonable for response length", async () => {
    const persona = makePersona();
    const shortResponse = "네.";
    const longResponse = "이것은 매우 긴 응답입니다. ".repeat(50);

    const personaRepository: PersonaRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(persona),
    };

    const shortGen: PersonaDialogueGenerator = {
      generateResponse: vi.fn().mockResolvedValue(shortResponse),
    };
    const longGen: PersonaDialogueGenerator = {
      generateResponse: vi.fn().mockResolvedValue(longResponse),
    };

    const ucShort = new GeneratePersonaResponseUseCase({
      personaRepository,
      personaDialogueGenerator: shortGen,
    });
    const ucLong = new GeneratePersonaResponseUseCase({
      personaRepository,
      personaDialogueGenerator: longGen,
    });

    // Run multiple trials to account for jitter
    const trials = 30;
    let shortTotal = 0;
    let longTotal = 0;

    for (let i = 0; i < trials; i++) {
      const shortResult = await ucShort.execute({
        personaId: "persona-1",
        userMessage: "hi",
        topic: "test",
        conversationHistory: [],
      });
      const longResult = await ucLong.execute({
        personaId: "persona-1",
        userMessage: "hi",
        topic: "test",
        conversationHistory: [],
      });
      shortTotal += shortResult.delayMs;
      longTotal += longResult.delayMs;
    }

    expect(longTotal / trials).toBeGreaterThan(shortTotal / trials);
  });
});
