import { StanceCalculator } from "@/domain/entities/stance-calculator";
import type { StanceVector } from "@/domain/entities/stance-vector";
import type { Answer } from "@/domain/entities/answer";
import type { Question } from "@/domain/entities/question";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type {
  LlmStanceExtractor,
  LlmExtractionInput,
} from "@/domain/interfaces/llm-stance-extractor";
import type { StanceResultOutput } from "../dtos/stance-result-output";

export interface ExtractStanceDeps {
  piiScrubber: PiiScrubber;
  llmExtractor: LlmStanceExtractor;
  questions: Question[];
}

export class ExtractStanceUseCase {
  constructor(private readonly deps: ExtractStanceDeps) {}

  async execute(
    sessionId: string,
    answers: Answer[],
  ): Promise<StanceResultOutput> {
    const codeVector = StanceCalculator.calculateFromAnswers(
      answers,
      this.deps.questions,
    );

    const openEndedAnswers = answers.filter((a) => a.isOpenEnded());

    if (openEndedAnswers.length === 0) {
      return this.buildOutput(sessionId, codeVector, "initial", null, 0.5);
    }

    const llmInputs = this.scrubAndPrepare(openEndedAnswers);
    const llmResult = await this.deps.llmExtractor.extract(llmInputs);

    const mergedVector = StanceCalculator.mergeWithLlmAxes(
      codeVector,
      llmResult.axes,
      0.3,
    );

    return this.buildOutput(
      sessionId,
      mergedVector,
      "refined",
      llmResult.reasoning,
      llmResult.readiness,
    );
  }

  private scrubAndPrepare(
    openEndedAnswers: Answer[],
  ): LlmExtractionInput[] {
    return openEndedAnswers.map((answer) => {
      const result = this.deps.piiScrubber.scrub(
        answer.value as string,
      );
      return {
        questionId: answer.questionId,
        scrubbedText: result.scrubbed,
      };
    });
  }

  private buildOutput(
    sessionId: string,
    vector: StanceVector,
    precision: "initial" | "refined",
    reasoning: string | null,
    readiness: number,
  ): StanceResultOutput {
    return {
      sessionId,
      vector: vector.toValues(),
      precision,
      reasoning,
      readiness,
    };
  }
}
