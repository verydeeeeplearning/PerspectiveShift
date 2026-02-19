"use client";

import { useCallback, useMemo, useState } from "react";
import { type RubricAnswerValue } from "./RubricQuestion";
import { ProgressBar } from "./ProgressBar";
import { PrecisionSelector } from "./PrecisionSelector";
import { OnboardingQuickUpsell } from "./OnboardingQuickUpsell";
import { OnboardingEmptyExtended } from "./OnboardingEmptyExtended";
import { OnboardingQuestionRenderer } from "./OnboardingQuestionRenderer";
import {
  emitOnboardingEvent,
  filterAnswersByQuestionSet,
  getPrecisionSelectEvent,
  toQuestionIdSet,
  type AnswerMap,
  type OnboardingEventName,
  type QuestionData,
} from "./onboarding-flow.helpers";
import {
  QUESTION_PRECISION_CONFIG,
  type QuestionPrecision,
} from "@/domain/value-objects/question-precision";
export type { AnswerMap, OnboardingEventName, QuestionData } from "./onboarding-flow.helpers";

interface OnboardingFlowProps {
  questions: QuestionData[];
  onCoreComplete: (answers: AnswerMap) => void;
  onExtendedComplete: (answers: AnswerMap) => void;
  onSkipExtended: () => void;
  onEvent?: (eventName: OnboardingEventName) => void;
}

export function OnboardingFlow({
  questions,
  onCoreComplete,
  onExtendedComplete,
  onSkipExtended,
  onEvent,
}: OnboardingFlowProps) {
  const [precision, setPrecision] = useState<QuestionPrecision | null>(null);
  const [isPrecisionEditorOpen, setIsPrecisionEditorOpen] = useState(false);
  const [phase, setPhase] = useState<"core" | "extended">("core");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [quickUpsellAnswers, setQuickUpsellAnswers] = useState<AnswerMap | null>(null);

  const coreQuestions = useMemo(
    () => questions.filter((question) => question.phase === "core"),
    [questions],
  );
  const extendedPool = useMemo(
    () => questions.filter((question) => question.phase === "extended"),
    [questions],
  );

  const buildQuestionSequence = useCallback(
    (targetPrecision: QuestionPrecision): QuestionData[] => {
      const targetTotal = QUESTION_PRECISION_CONFIG[targetPrecision].totalQuestions;
      const targetExtendedCount = Math.max(
        0,
        Math.min(extendedPool.length, targetTotal - coreQuestions.length),
      );
      return [
        ...coreQuestions,
        ...extendedPool.slice(0, targetExtendedCount),
      ];
    },
    [coreQuestions, extendedPool],
  );

  const selectedQuestionSequence = useMemo(
    () => (precision ? buildQuestionSequence(precision) : []),
    [buildQuestionSequence, precision],
  );

  const emitEvent = useCallback(
    (eventName: OnboardingEventName) => {
      emitOnboardingEvent(eventName, onEvent);
    },
    [onEvent],
  );

  const currentPhaseQuestions = useMemo(() => {
    if (!precision) {
      return [] as QuestionData[];
    }
    if (phase === "core") {
      return coreQuestions;
    }
    return selectedQuestionSequence.slice(coreQuestions.length);
  }, [coreQuestions, phase, precision, selectedQuestionSequence]);

  const currentQuestion = currentPhaseQuestions[currentIndex];

  const completeFlow = useCallback(
    (targetPrecision: QuestionPrecision, finalAnswers: AnswerMap) => {
      if (targetPrecision === "quick") {
        onCoreComplete(finalAnswers);
        return;
      }
      onExtendedComplete(finalAnswers);
    },
    [onCoreComplete, onExtendedComplete],
  );

  const handlePrecisionSelect = useCallback(
    (targetPrecision: QuestionPrecision) => {
      const precisionSelectEvent = getPrecisionSelectEvent(targetPrecision);

      if (!precision) {
        emitEvent(precisionSelectEvent);
        setPrecision(targetPrecision);
        setPhase("core");
        setCurrentIndex(0);
        setAnswers({});
        setQuickUpsellAnswers(null);
        return;
      }

      if (precision !== targetPrecision) {
        emitEvent("precision_change_midway");
      }
      emitEvent(precisionSelectEvent);

      const nextSequence = buildQuestionSequence(targetPrecision);
      const nextQuestionSet = toQuestionIdSet(nextSequence);
      const nextAnswers = filterAnswersByQuestionSet(answers, nextQuestionSet);
      const answeredQuestionIds = new Set(
        Object.keys(nextAnswers).map((questionId) => Number(questionId)),
      );
      const firstUnansweredIndex = nextSequence.findIndex(
        (question) => !answeredQuestionIds.has(question.id),
      );

      setPrecision(targetPrecision);
      setAnswers(nextAnswers);
      setIsPrecisionEditorOpen(false);
      setQuickUpsellAnswers(null);

      if (firstUnansweredIndex === -1) {
        completeFlow(targetPrecision, nextAnswers);
        return;
      }

      if (firstUnansweredIndex < coreQuestions.length) {
        setPhase("core");
        setCurrentIndex(firstUnansweredIndex);
        return;
      }

      setPhase("extended");
      setCurrentIndex(firstUnansweredIndex - coreQuestions.length);
    },
    [
      answers,
      buildQuestionSequence,
      completeFlow,
      coreQuestions.length,
      emitEvent,
      precision,
    ],
  );

  const handleAnswer = useCallback(
    (
      questionId: number,
      value: boolean | RubricAnswerValue | string,
    ) => {
      if (!precision || !currentQuestion) {
        return;
      }

      const nextAnswers = { ...answers, [questionId]: value };
      if (currentQuestion.type === "OX") {
        emitEvent("question_answer_ox");
      } else if (currentQuestion.type === "RUBRIC") {
        emitEvent("question_answer_rubric");
        if (value === "DONT_KNOW") {
          emitEvent("question_dontknow");
        }
      } else {
        emitEvent("question_answer_open_ended");
      }
      setAnswers(nextAnswers);

      const nextIndex = currentIndex + 1;
      if (nextIndex < currentPhaseQuestions.length) {
        setCurrentIndex(nextIndex);
        return;
      }

      if (phase === "core") {
        if (precision === "quick") {
          setQuickUpsellAnswers(nextAnswers);
          return;
        }

        const extendedQuestions = selectedQuestionSequence.slice(coreQuestions.length);
        if (extendedQuestions.length === 0) {
          completeFlow(precision, nextAnswers);
          return;
        }

        setPhase("extended");
        setCurrentIndex(0);
        return;
      }

      completeFlow(precision, nextAnswers);
    },
    [
      answers,
      completeFlow,
      coreQuestions.length,
      currentIndex,
      currentQuestion,
      currentPhaseQuestions.length,
      emitEvent,
      phase,
      precision,
      selectedQuestionSequence,
    ],
  );

  if (!precision) {
    return <PrecisionSelector onSelect={handlePrecisionSelect} />;
  }

  if (quickUpsellAnswers) {
    return (
      <OnboardingQuickUpsell
        precision={precision}
        quickUpsellAnswers={quickUpsellAnswers}
        onSelectPrecision={handlePrecisionSelect}
        onCompleteQuick={(finalAnswers) => completeFlow("quick", finalAnswers)}
        onClose={() => setQuickUpsellAnswers(null)}
      />
    );
  }

  const precisionConfig = QUESTION_PRECISION_CONFIG[precision];
  const phaseTotal =
    phase === "core"
      ? coreQuestions.length
      : selectedQuestionSequence.length - coreQuestions.length;

  if (isPrecisionEditorOpen) {
    return (
      <PrecisionSelector
        selectedPrecision={precision}
        onSelect={handlePrecisionSelect}
        onClose={() => setIsPrecisionEditorOpen(false)}
      />
    );
  }

  if (!currentQuestion) {
    if (phase === "extended") {
      return <OnboardingEmptyExtended onSkipExtended={onSkipExtended} />;
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-8 py-4">
      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
        <p className="text-sm text-gray-600">
          정밀도: <span className="font-semibold">{precisionConfig.label}</span> (
          {precisionConfig.totalQuestions}문항)
        </p>
        <button
          type="button"
          onClick={() => setIsPrecisionEditorOpen(true)}
          className="text-sm text-blue-700 underline underline-offset-2"
        >
          [변경]
        </button>
      </div>

      <ProgressBar
        current={Math.min(currentIndex + 1, Math.max(phaseTotal, 1))}
        total={Math.max(phaseTotal, 1)}
        phase={phase}
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
