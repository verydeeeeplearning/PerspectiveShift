"use server";

import { Answer } from "@/domain/entities/answer";
import { Question } from "@/domain/entities/question";
import type { CoreValueKey } from "@/domain/value-objects/core-value";
import { ExtractStanceUseCase } from "@/application/use-cases/extract-stance";
import { GenerateThoughtMapUseCase } from "@/application/use-cases/generate-thought-map";
import { RegexPiiScrubber } from "@/infrastructure/external/regex-pii-scrubber";
import { KgssBaselineProvider } from "@/infrastructure/external/kgss-baseline-provider";
import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import type { LlmStanceExtractor } from "@/domain/interfaces/llm-stance-extractor";
import type { ThoughtMapOutput } from "@/application/dtos/thought-map-output";
import type { AnswerMap } from "./components/OnboardingFlow";
import questionsData from "@/infrastructure/external/data/questions.json";
import type { QuestionProps } from "@/domain/entities/question";

const questions = questionsData.map((q) =>
  Question.create(q as QuestionProps),
);

function createInMemoryRepository(): StanceRepository {
  const store = new Map<string, Parameters<StanceRepository["save"]>[0]>();
  return {
    async save(profile) {
      store.set(profile.sessionId, profile);
    },
    async findBySessionId(sessionId) {
      return store.get(sessionId) ?? null;
    },
    async update() {},
  };
}

function createFallbackExtractor(): LlmStanceExtractor {
  return {
    async extract() {
      return { axes: {}, reasoning: "", readiness: 0.5 };
    },
  };
}

function answerMapToDomainAnswers(
  answerMap: AnswerMap,
): Answer[] {
  return Object.entries(answerMap).map(([qId, value]) => {
    const questionId = Number(qId);
    const question = questions.find((q) => q.id === questionId);
    if (!question) throw new Error(`Unknown question: ${questionId}`);

    switch (question.type) {
      case "OX":
        return Answer.ox(questionId, value as boolean);
      case "RUBRIC": {
        const rubricValue = value as number | "DONT_KNOW" | "DEPENDS";
        if (rubricValue === "DONT_KNOW" || rubricValue === "DEPENDS") {
          // Treat uncertain answers as neutral stance for scoring.
          return Answer.rubric(questionId, 3);
        }
        return Answer.rubric(questionId, rubricValue);
      }
      case "OPEN_ENDED":
        return Answer.openEnded(questionId, value as string);
      default:
        throw new Error(`Unknown type: ${question.type}`);
    }
  });
}

export async function calculateStance(
  sessionId: string,
  answerMap: AnswerMap,
): Promise<ThoughtMapOutput> {
  const answers = answerMapToDomainAnswers(answerMap);

  let llmExtractor: LlmStanceExtractor;
  try {
    if (process.env.OPENAI_API_KEY) {
      const { OpenAiStanceExtractor } = await import(
        "@/infrastructure/external/openai-stance-extractor"
      );
      llmExtractor = new OpenAiStanceExtractor(
        process.env.OPENAI_API_KEY,
      );
    } else {
      llmExtractor = createFallbackExtractor();
    }
  } catch {
    llmExtractor = createFallbackExtractor();
  }

  const extractUseCase = new ExtractStanceUseCase({
    piiScrubber: new RegexPiiScrubber(),
    llmExtractor,
    questions,
  });

  const stanceResult = await extractUseCase.execute(
    sessionId,
    answers,
  );

  const repo = createInMemoryRepository();
  const generateUseCase = new GenerateThoughtMapUseCase({
    baselineProvider: new KgssBaselineProvider(),
    stanceRepository: repo,
  });

  return generateUseCase.execute(stanceResult);
}

export async function submitSelfAffirmation(
  sessionId: string,
  coreValue: CoreValueKey,
  experience?: string,
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/onboarding/self-affirmation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, coreValue, experience }),
      },
    );

    if (!response.ok) {
      return { success: false };
    }

    return { success: true };
  } catch {
    return { success: false };
  }
}
