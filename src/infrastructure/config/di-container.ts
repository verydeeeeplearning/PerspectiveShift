import { Question } from "@/domain/entities/question";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type { LlmStanceExtractor } from "@/domain/interfaces/llm-stance-extractor";
import type { BaselineProvider } from "@/domain/interfaces/baseline-provider";
import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import { RegexPiiScrubber } from "../external/regex-pii-scrubber";
import { OpenAiStanceExtractor } from "../external/openai-stance-extractor";
import { KgssBaselineProvider } from "../external/kgss-baseline-provider";
import { SupabaseStanceRepository } from "../persistence/supabase-stance-repository";
import { getSupabaseClient } from "../persistence/supabase-client";
import { ExtractStanceUseCase } from "@/application/use-cases/extract-stance";
import { GenerateThoughtMapUseCase } from "@/application/use-cases/generate-thought-map";
import { SubmitAnswerUseCase } from "@/application/use-cases/submit-answer";
import questionsData from "../external/data/questions.json";
import type { QuestionProps } from "@/domain/entities/question";

function loadQuestions(): Question[] {
  return questionsData.map((q) =>
    Question.create(q as QuestionProps),
  );
}

export interface Container {
  piiScrubber: PiiScrubber;
  llmExtractor: LlmStanceExtractor;
  baselineProvider: BaselineProvider;
  stanceRepository: StanceRepository;
  questions: Question[];
  submitAnswerUseCase: SubmitAnswerUseCase;
  extractStanceUseCase: ExtractStanceUseCase;
  generateThoughtMapUseCase: GenerateThoughtMapUseCase;
}

let container: Container | null = null;

export function getContainer(): Container {
  if (container) return container;

  const piiScrubber = new RegexPiiScrubber();
  const openaiKey = process.env.OPENAI_API_KEY;
  const llmExtractor = openaiKey
    ? new OpenAiStanceExtractor(openaiKey)
    : createFallbackExtractor();
  const baselineProvider = new KgssBaselineProvider();
  const stanceRepository = new SupabaseStanceRepository(
    getSupabaseClient(),
  );
  const questions = loadQuestions();

  container = {
    piiScrubber,
    llmExtractor,
    baselineProvider,
    stanceRepository,
    questions,
    submitAnswerUseCase: new SubmitAnswerUseCase(),
    extractStanceUseCase: new ExtractStanceUseCase({
      piiScrubber,
      llmExtractor,
      questions,
    }),
    generateThoughtMapUseCase: new GenerateThoughtMapUseCase({
      baselineProvider,
      stanceRepository,
    }),
  };

  return container;
}

function createFallbackExtractor(): LlmStanceExtractor {
  return {
    async extract() {
      return { axes: {}, reasoning: "", readiness: 0.5 };
    },
  };
}

export function resetContainer(): void {
  container = null;
}
