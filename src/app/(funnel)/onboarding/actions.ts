"use server";

import { Answer } from "@/domain/entities/answer";
import { Question } from "@/domain/entities/question";
import type { CoreValueKey } from "@/domain/value-objects/core-value";
import { ExtractStanceUseCase } from "@/application/use-cases/extract-stance";
import { GenerateThoughtMapUseCase } from "@/application/use-cases/generate-thought-map";
import { RegexPiiScrubber } from "@/infrastructure/external/regex-pii-scrubber";
import { KgssBaselineProvider } from "@/infrastructure/external/kgss-baseline-provider";
import { getContainer } from "@/infrastructure/config/di-container";
import type { LlmStanceExtractor } from "@/domain/interfaces/llm-stance-extractor";
import type { ThoughtMapOutput } from "@/application/dtos/thought-map-output";
import type { AnswerMap } from "./components/OnboardingFlow";
import questionsData from "@/infrastructure/external/data/questions.json";
import expandedQuestionsData from "@/infrastructure/external/data/expanded-questions.json";
import type { QuestionProps } from "@/domain/entities/question";

const questions = questionsData.map((q) =>
  Question.create(q as QuestionProps),
);

const allStaticQuestions = [
  ...questionsData,
  ...expandedQuestionsData,
].map((q) => Question.create(q as QuestionProps));

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
  demographic?: { ageGroup: string; jobCategory: string },
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

  const container = getContainer();
  const generateUseCase = new GenerateThoughtMapUseCase({
    baselineProvider: new KgssBaselineProvider(),
    stanceRepository: container.stanceRepository,
  });

  const output = await generateUseCase.execute(stanceResult);

  // Save demographic info if provided
  if (demographic) {
    try {
      await container.stanceRepository.update(sessionId, {
        ageGroup: demographic.ageGroup,
        jobCategory: demographic.jobCategory,
      });
    } catch {
      // Non-critical: demographic save failure shouldn't block the flow
    }
  }

  return output;
}

export async function calculateDynamicStance(
  sessionId: string,
  answerMap: AnswerMap,
  generatedQuestionsMeta: Array<{
    id: string;
    numericId: number;
    type: "OX" | "RUBRIC";
    dimension: string;
    polarity: 1 | -1;
  }>,
  demographic?: { ageGroup: string; jobCategory: string },
): Promise<ThoughtMapOutput> {
  // Build a combined question list: static + generated
  const generatedQuestions = generatedQuestionsMeta.map((q) =>
    Question.create({
      id: q.numericId,
      text: q.id, // placeholder; not used in calculation
      type: q.type,
      dimension: q.dimension as import("@/domain/value-objects/stance-dimension").StanceDimension,
      phase: "extended",
      polarity: q.polarity,
    }),
  );

  const combinedQuestions = [...allStaticQuestions, ...generatedQuestions];

  // Convert answers, mapping generated question string IDs to numeric IDs
  const genIdMap = new Map(generatedQuestionsMeta.map((q) => [q.id, q.numericId]));
  const answers: Answer[] = [];

  for (const [qId, value] of Object.entries(answerMap)) {
    const numericId = genIdMap.get(qId) ?? Number(qId);
    const question = combinedQuestions.find((q) => q.id === numericId);
    if (!question) continue;

    switch (question.type) {
      case "OX":
        answers.push(Answer.ox(numericId, value as boolean));
        break;
      case "RUBRIC": {
        const rubricValue = value as number | "DONT_KNOW" | "DEPENDS";
        if (rubricValue === "DONT_KNOW" || rubricValue === "DEPENDS") {
          answers.push(Answer.rubric(numericId, 3));
        } else {
          answers.push(Answer.rubric(numericId, rubricValue));
        }
        break;
      }
      case "OPEN_ENDED":
        answers.push(Answer.openEnded(numericId, value as string));
        break;
    }
  }

  let llmExtractor: LlmStanceExtractor;
  try {
    if (process.env.OPENAI_API_KEY) {
      const { OpenAiStanceExtractor } = await import(
        "@/infrastructure/external/openai-stance-extractor"
      );
      llmExtractor = new OpenAiStanceExtractor(process.env.OPENAI_API_KEY);
    } else {
      llmExtractor = createFallbackExtractor();
    }
  } catch {
    llmExtractor = createFallbackExtractor();
  }

  const extractUseCase = new ExtractStanceUseCase({
    piiScrubber: new RegexPiiScrubber(),
    llmExtractor,
    questions: combinedQuestions,
  });

  const stanceResult = await extractUseCase.execute(sessionId, answers);

  const container = getContainer();
  const generateUseCase = new GenerateThoughtMapUseCase({
    baselineProvider: new KgssBaselineProvider(),
    stanceRepository: container.stanceRepository,
  });

  const output = await generateUseCase.execute(stanceResult);

  if (demographic) {
    try {
      await container.stanceRepository.update(sessionId, {
        ageGroup: demographic.ageGroup,
        jobCategory: demographic.jobCategory,
      });
    } catch {
      // Non-critical
    }
  }

  return output;
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
