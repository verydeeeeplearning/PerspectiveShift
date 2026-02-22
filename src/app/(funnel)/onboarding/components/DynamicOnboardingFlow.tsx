"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type RubricAnswerValue } from "./RubricQuestion";
import { PrecisionSelector } from "./PrecisionSelector";
import { BatchLoadingIndicator } from "./BatchLoadingIndicator";
import { DynamicOnboardingQuestionView } from "./DynamicOnboardingQuestionView";
import {
  emitOnboardingEvent, filterAnswersByQuestionSet, getPrecisionSelectEvent,
  toQuestionIdSet, type AnswerMap, type OnboardingEventName, type QuestionData,
} from "./onboarding-flow.helpers";
import {
  QUESTION_PRECISION_CONFIG, type QuestionPrecision,
} from "@/domain/value-objects/question-precision";
import {
  buildLocalFallbackBatch, chunkGeneratedBatches, hasAnswered,
} from "./dynamic-onboarding.helpers";
import {
  useBatchLoader, type GeneratedQuestionMeta, type SeedQuestionMeta,
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
const LOCAL_FALLBACK_BATCH_SIZE = 5;

export function DynamicOnboardingFlow({
  seedQuestions,
  seedMeta,
  onComplete,
  onEvent,
}: DynamicOnboardingFlowProps) {
  const [precision, setPrecision] = useState<QuestionPrecision | null>(null);
  const [isPrecisionEditorOpen, setIsPrecisionEditorOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [generatedBatches, setGeneratedBatches] = useState<
    GeneratedQuestionMeta[][]
  >([]);
  const [ignoreBatchError, setIgnoreBatchError] = useState(false);
  const [shouldLoadAfterPrecisionChange, setShouldLoadAfterPrecisionChange] =
    useState(false);

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
    targetTotal,
    answers,
    allQuestions,
    generatedBatches,
  });

  const currentQuestion = allQuestions[currentIndex];
  const totalAnswered = Object.keys(answers).length;
  const allGeneratedMeta = useMemo(() => generatedBatches.flat(), [generatedBatches]);
  const generatedCount = allGeneratedMeta.length;
  const batchCount = generatedBatches.length;

  const loadNextBatch = useCallback(() => {
    setIgnoreBatchError(false);
    emitEvent("batch_loading");
    batchLoader.load((result) => {
      setGeneratedBatches((prev) => [...prev, result.questions]);
      setCurrentIndex(seedQuestions.length + generatedCount);
      emitEvent("batch_loaded");
    });
  }, [batchLoader, emitEvent, generatedCount, seedQuestions.length]);

  useEffect(() => {
    if (!shouldLoadAfterPrecisionChange) return;
    setShouldLoadAfterPrecisionChange(false);
    loadNextBatch();
  }, [loadNextBatch, shouldLoadAfterPrecisionChange]);

  const handleContinueWithFallback = useCallback(() => {
    if (!precision) return;

    const remaining = targetTotal - totalAnswered;
    if (remaining <= 0) {
      onComplete(answers, allGeneratedMeta);
      return;
    }

    const batchSize = Math.min(LOCAL_FALLBACK_BATCH_SIZE, remaining);
    const nextBatchIndex = batchCount;
    const fallbackBatch = buildLocalFallbackBatch({
      existingQuestions: allQuestions,
      batchIndex: nextBatchIndex,
      batchSize,
    });

    if (fallbackBatch.length === 0) return;

    setGeneratedBatches((prev) => [...prev, fallbackBatch]);
    setIgnoreBatchError(true);
    setCurrentIndex(seedQuestions.length + generatedCount);
    emitEvent("batch_loaded");
  }, [allGeneratedMeta, allQuestions, answers, emitEvent, batchCount, generatedCount,
    onComplete, precision, seedQuestions.length, targetTotal, totalAnswered]);

  const handlePrecisionSelect = useCallback(
    (selected: QuestionPrecision) => {
      if (precision && precision !== selected) {
        emitEvent("precision_change_midway");
      }
      emitEvent(getPrecisionSelectEvent(selected));

      if (!precision) {
        setPrecision(selected);
        setCurrentIndex(0);
        setAnswers({});
        setGeneratedBatches([]);
        setIgnoreBatchError(false);
        setIsPrecisionEditorOpen(false);
        batchLoader.clearPrefetch();
        return;
      }

      const nextTotal = QUESTION_PRECISION_CONFIG[selected].totalQuestions;
      const maxGeneratedCount = Math.max(0, nextTotal - seedQuestions.length);
      const trimmedGenerated = allGeneratedMeta.slice(0, maxGeneratedCount);
      const trimmedBatches = chunkGeneratedBatches(trimmedGenerated);
      const nextSequence: QuestionData[] = [
        ...seedQuestions,
        ...trimmedGenerated.map((question) => ({
          id: question.id,
          text: question.text,
          type: question.type,
          phase: "generated" as const,
          dimension: question.dimension,
          polarity: question.polarity,
        })),
      ];
      const nextAnswers = filterAnswersByQuestionSet(
        answers,
        toQuestionIdSet(nextSequence),
      );
      const firstUnansweredIndex = nextSequence.findIndex(
        (question) => !hasAnswered(nextAnswers, question.id),
      );

      setPrecision(selected);
      setGeneratedBatches(trimmedBatches);
      setAnswers(nextAnswers);
      setIgnoreBatchError(false);
      setIsPrecisionEditorOpen(false);
      batchLoader.clearPrefetch();

      const answeredCount = Object.keys(nextAnswers).length;
      if (answeredCount >= nextTotal) {
        setCurrentIndex(Math.max(nextSequence.length - 1, 0));
        onComplete(nextAnswers, trimmedGenerated);
        return;
      }

      if (firstUnansweredIndex === -1) {
        setCurrentIndex(Math.max(nextSequence.length - 1, 0));
        setShouldLoadAfterPrecisionChange(true);
        return;
      }

      setCurrentIndex(firstUnansweredIndex);
    },
    [allGeneratedMeta, answers, batchLoader, emitEvent, onComplete, precision, seedQuestions],
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
    [allGeneratedMeta, allQuestions.length, answers, batchLoader, currentIndex,
      currentQuestion, emitEvent, loadNextBatch, onComplete, precision, targetTotal],
  );

  if (isPrecisionEditorOpen && precision) {
    return (
      <PrecisionSelector
        selectedPrecision={precision}
        onSelect={handlePrecisionSelect}
        onClose={() => setIsPrecisionEditorOpen(false)}
      />
    );
  }

  if (!precision) {
    return <PrecisionSelector onSelect={handlePrecisionSelect} />;
  }

  if (batchLoader.loading || (batchLoader.error && !ignoreBatchError)) {
    return (
      <BatchLoadingIndicator
        batchIndex={generatedBatches.length}
        totalAnswered={totalAnswered}
        targetTotal={targetTotal}
        error={batchLoader.error}
        onRetry={loadNextBatch}
        onContinueWithFallback={handleContinueWithFallback}
      />
    );
  }

  if (!currentQuestion) return null;

  const config = QUESTION_PRECISION_CONFIG[precision];

  return (
    <DynamicOnboardingQuestionView
      label={config.label}
      totalQuestions={config.totalQuestions}
      totalAnswered={totalAnswered}
      targetTotal={targetTotal}
      currentIndex={currentIndex}
      seedCount={seedQuestions.length}
      currentQuestion={currentQuestion}
      answers={answers}
      onAnswer={handleAnswer}
      onCoachClick={() => emitEvent("coach_click")}
      onExampleSwipe={() => emitEvent("example_swipe")}
      onEditPrecision={() => setIsPrecisionEditorOpen(true)}
    />
  );
}
