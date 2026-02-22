import expandedQuestions from "@/infrastructure/external/data/expanded-questions.json";
import type { AnswerMap, QuestionData } from "./onboarding-flow.helpers";
import type { GeneratedQuestionMeta } from "./useBatchLoader";

const LOCAL_FALLBACK_BATCH_SIZE = 5;

interface LocalFallbackQuestion {
  id: number;
  text: string;
  type: "OX" | "RUBRIC";
  dimension: string;
  polarity: 1 | -1;
}

const LOCAL_FALLBACK_POOL = expandedQuestions as LocalFallbackQuestion[];

export function chunkGeneratedBatches(
  questions: GeneratedQuestionMeta[],
): GeneratedQuestionMeta[][] {
  const chunks: GeneratedQuestionMeta[][] = [];
  for (let i = 0; i < questions.length; i += LOCAL_FALLBACK_BATCH_SIZE) {
    chunks.push(questions.slice(i, i + LOCAL_FALLBACK_BATCH_SIZE));
  }
  return chunks;
}

export function hasAnswered(
  answers: AnswerMap,
  questionId: number | string,
): boolean {
  return Object.prototype.hasOwnProperty.call(answers, String(questionId));
}

interface BuildLocalFallbackBatchInput {
  existingQuestions: QuestionData[];
  batchIndex: number;
  batchSize: number;
}

export function buildLocalFallbackBatch({
  existingQuestions,
  batchIndex,
  batchSize,
}: BuildLocalFallbackBatchInput): GeneratedQuestionMeta[] {
  const usedTexts = new Set(
    existingQuestions.map((question) => question.text.trim()),
  );

  let available = LOCAL_FALLBACK_POOL.filter(
    (question) => !usedTexts.has(question.text.trim()),
  );
  if (available.length < batchSize) {
    available = [...LOCAL_FALLBACK_POOL];
  }

  return available.slice(0, batchSize).map((question, index) => ({
    id: `fallback-${batchIndex}-${index}-${question.id}`,
    text: question.text,
    type: question.type,
    dimension: question.dimension,
    polarity: question.polarity,
    batchIndex,
  }));
}
