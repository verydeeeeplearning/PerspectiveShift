import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import { ReflectionItem, type ReflectionType } from "@/domain/value-objects/reflection-item";
import type { SubmitReflectionInput } from "../dtos/reflection-input";
import type { ReflectionOutput } from "../dtos/reflection-output";

export interface SubmitReflectionDeps {
  dialogueRepository: DialogueRepository;
}

export class SubmitReflectionUseCase {
  constructor(private readonly deps: SubmitReflectionDeps) {}

  async execute(input: SubmitReflectionInput): Promise<ReflectionOutput> {
    const session = await this.deps.dialogueRepository.findSessionById(input.sessionId);
    if (!session) {
      throw new Error(`Dialogue session ${input.sessionId} not found`);
    }

    const reflectionItems = input.items.map((item) =>
      ReflectionItem.create(item.type as ReflectionType, item.content),
    );

    return {
      sessionId: input.sessionId,
      participantId: input.participantId,
      items: reflectionItems.map((item) => ({
        type: item.type,
        content: item.content,
        isRequired: item.isRequired,
      })),
      submittedAt: new Date().toISOString(),
    };
  }
}
