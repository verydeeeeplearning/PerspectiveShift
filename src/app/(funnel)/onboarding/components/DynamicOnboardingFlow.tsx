"use client";

import { useCallback, useMemo, useState } from "react";
import { type RubricAnswerValue } from "./RubricQuestion";
import { ProgressBar } from "./ProgressBar";
import { PrecisionSelector } from "./PrecisionSelector";
import { BatchLoadingIndicator } from "./BatchLoadingIndicator";
import { OnboardingQuestionRenderer } from "./OnboardingQuestionRenderer";
import {
  emitOnboardingEvent,
  getPrecisionSelectEvent,
  type AnswerMap,
  type OnboardingEventName,
  type QuestionData,
} from "./onboarding-flow.helpers";
import {
  QUESTION_PRECISION_CONFIG,
  type QuestionPrecision,
} from "@/domain/value-objects/question-precision";
import {
  useBatchLoader,
  type GeneratedQuestionMeta,
  type SeedQuestionMeta,
} from "./useBatchLoader";

export type { GeneratedQuestionMeta, SeedQuestionMeta };

export interface DynamicOnboardingFlowProps {
  seedQuestions: QuestionData[];
  seedMeta: SeedQuestionMeta[];
  onComplete: (
    answers: AnswerMap,
    generatedMeta: GeneratedQuestionMeta[],
  ) => void;
  onEvent?: (eventName: OnboardingEventName) => void;
}

const BATCH_PREFETCH_THRESHOLD = 3;

export function DynamicOnboardingFlow({
  seedQuestions,
  seedMeta,
  onComplete,
  onEvent,
}: DynamicOnboardingFlowProps) {
  const [precision, setPrecision] = useState<QuestionPrecision | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [generatedBatches, setGeneratedBatches] = useState<
    GeneratedQuestionMeta[][]
  >([]);

  const emitEvent = useCallback(
    (eventName: OnboardingEventName) => {
      emitOnboardingEvent(eventName, onEvent);
    },
    [onEvent],
  );

  const allQuestions = useMemo<QuestionData[]>(() => {
    const generated: QuestionData[] = generatedBatches.flat().map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      phase: "generated" as const,
      dimension: q.dimension,
      polarity: q.polarity,
    }));
    return [...seedQuestions, ...generated];
  }, [seedQuestions, generatedBatches]);

  const targetTotal = precision
    ? QUESTION_PRECISION_CONFIG[precision].totalQuestions
    : 0;

  const batchLoader = useBatchLoader({
    seedMeta,
    seedCount: seedQuestions.length,
    targetTotal,
    answers,
    allQuestions,
    generatedBatches,
  });

  const currentQuestion = allQuestions[currentIndex];
  const totalAnswered = Object.keys(answers).length;
  const allGeneratedMeta = useMemo(
    () => generatedBatches.flat(),
    [generatedBatches],
  );

  const loadNextBatch = useCallback(() => {
    emitEvent("batch_loading");
    batchLoader.load((result) => {
      setGeneratedBatches((prev) => [...prev, result.questions]);
      setCurrentIndex(
        seedQuestions.length + generatedBatches.flat().length,
      );
      emitEvent("batch_loaded");
    });
  }, [batchLoader, emitEvent, generatedBatches, seedQuestions.length]);

  const handlePrecisionSelect = useCallback(
    (selected: QuestionPrecision) => {
      emitEvent(getPrecisionSelectEvent(selected));
      setPrecision(selected);
      setCurrentIndex(0);
      setAnswers({});
      setGeneratedBatches([]);
      batchLoader.clearPrefetch();
    },
    [batchLoader, emitEvent],
  );

  const handleAnswer = useCallback(
    (questionId: number | string, value: boolean | RubricAnswerValue | string) => {
      if (!precision || !currentQuestion) return;

      const nextAnswers = { ...answers, [questionId]: value };
      if (currentQuestion.type === "OX") {
        emitEvent("question_answer_ox");
      } else if (currentQuestion.type === "RUBRIC") {
        emitEvent("question_answer_rubric");
        if (value === "DONT_KNOW") emitEvent("question_dontknow");
      } else {
        emitEvent("question_answer_open_ended");
      }

      setAnswers(nextAnswers);
      const nextIndex = currentIndex + 1;
      const answeredCount = Object.keys(nextAnswers).length;

      if (answeredCount >= targetTotal) {
        onComplete(nextAnswers, allGeneratedMeta);
        return;
      }

      if (nextIndex < allQuestions.length) {
        setCurrentIndex(nextIndex);
        const remaining = allQuestions.length - nextIndex;
        if (remaining <= BATCH_PREFETCH_THRESHOLD && answeredCount < targetTotal) {
          batchLoader.prefetch();
        }
        return;
      }

      loadNextBatch();
    },
    [
      allGeneratedMeta, allQuestions.length, answers, batchLoader,
      currentIndex, currentQuestion, emitEvent, loadNextBatch,
      onComplete, precision, targetTotal,
    ],
  );

  if (!precision) {
    return <PrecisionSelector onSelect={handlePrecisionSelect} />;
  }

  if (batchLoader.loading || batchLoader.error) {
    return (
      <BatchLoadingIndicator
        batchIndex={generatedBatches.length}
        totalAnswered={totalAnswered}
        targetTotal={targetTotal}
        error={batchLoader.error}
        onRetry={loadNextBatch}
      />
    );
  }

  if (!currentQuestion) return null;

  const config = QUESTION_PRECISION_CONFIG[precision];

  return (
    <div className="flex flex-col gap-8 py-4">
      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
        <p className="text-sm text-gray-600">
          정밀도: <span className="font-semibold">{config.label}</span> (
          {config.totalQuestions}문항)
        </p>
        <span className="text-xs text-gray-500">
          {totalAnswered}/{targetTotal}
        </span>
      </div>

      <ProgressBar
        current={Math.min(totalAnswered + 1, targetTotal)}
        total={targetTotal}
        phase={currentIndex < seedQuestions.length ? "core" : "extended"}
      />

      <div className="min-h-[240px]">
        <OnboardingQuestionRenderer
          question={currentQuestion}
          answers={answers}
          onAnswer={handleAnswer}
          onCoachClick={() => emitEvent("coach_click")}
          onExampleSwipe={() => emitEvent("example_swipe")}
        />
      </div>
    </div>
  );
}
