import { describe, it, expect } from "vitest";
import { ResumePersonaConversationUseCase } from "../resume-persona-conversation";
import { InMemorySavedPersonaRepository } from "@/infrastructure/persistence/in-memory-saved-persona-repository";
import { SavePersonaUseCase } from "../save-persona";

describe("ResumePersonaConversationUseCase", () => {
  it("returns empty context when there is no saved persona", async () => {
    const repository = new InMemorySavedPersonaRepository();
    const uc = new ResumePersonaConversationUseCase(repository);

    const result = await uc.execute({
      userId: "u-1",
      personaId: "p-1",
    });

    expect(result.conversationCount).toBe(0);
    expect(result.memoryContext.conversationSummaries).toHaveLength(0);
  });

  it("returns stored memory context", async () => {
    const repository = new InMemorySavedPersonaRepository();
    const saveUc = new SavePersonaUseCase(repository);
    const uc = new ResumePersonaConversationUseCase(repository);

    await saveUc.execute({
      userId: "u-1",
      personaId: "p-1",
      conversationSummary: "요약",
      sharedContext: ["환경"],
      userStanceMemory: ["형평성"],
      savedQuestions: ["재원은?"],
    });

    const result = await uc.execute({
      userId: "u-1",
      personaId: "p-1",
    });

    expect(result.conversationCount).toBe(1);
    expect(result.memoryContext.sharedContext).toContain("환경");
    expect(result.memoryContext.savedQuestions).toContain("재원은?");
  });
});
