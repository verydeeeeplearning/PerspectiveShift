import type { TrailerGenerator } from "@/domain/interfaces/trailer-generator";
import type { StanceVector } from "@/domain/entities/stance-vector";

export interface GenerateTrailerInput {
  opponentStance: StanceVector;
  myStance: StanceVector;
  topic: string;
}

export interface GenerateTrailerOutput {
  line1: string;
  line2: string;
  line3: string | null;
}

export interface GenerateTrailerDeps {
  trailerGenerator: TrailerGenerator;
}

export class GenerateConversationTrailerUseCase {
  constructor(private deps: GenerateTrailerDeps) {}

  async execute(
    input: GenerateTrailerInput,
  ): Promise<GenerateTrailerOutput> {
    const trailer = await this.deps.trailerGenerator.generate(
      input.opponentStance,
      input.myStance,
      input.topic,
    );

    const lines = trailer.text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    return {
      line1: lines[0] || "",
      line2: lines[1] || "",
      line3: lines[2] || null,
    };
  }
}
