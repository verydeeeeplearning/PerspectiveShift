import { describe, it, expect } from "vitest";
import { SavePersonaUseCase } from "../save-persona";
import { InMemorySavedPersonaRepository } from "@/infrastructure/persistence/in-memory-saved-persona-repository";

describe("SavePersonaUseCase", () => {
  it("creates and updates saved persona memory", async () => {
    const repository = new InMemorySavedPersonaRepository();
    const uc = new SavePersonaUseCase(repository);

    const first = await uc.execute({
      userId: "u-1",
      personaId: "p-1",
      conversationSummary: "첫 대화 요약",
      sharedContext: ["교육"],
    });

    expect(first.conversationCount).toBe(1);

    const second = await uc.execute({
      userId: "u-1",
      personaId: "p-1",
      conversationSummary: "두 번째 대화 요약",
      userStanceMemory: ["효율성도 중요"],
    });

    expect(second.conversationCount).toBe(2);
    expect(second.conversationSummaries).toContain("첫 대화 요약");
    expect(second.userStanceMemory).toContain("효율성도 중요");
  });
});
