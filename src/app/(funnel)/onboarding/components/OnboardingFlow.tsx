"use client";

import { useState, useCallback } from "react";
import { OxQuestion } from "./OxQuestion";
import { RubricQuestion } from "./RubricQuestion";
import { OpenEndedQuestion } from "./OpenEndedQuestion";
import { ProgressBar } from "./ProgressBar";

export interface QuestionData {
  id: number;
  text: string;
  type: "OX" | "RUBRIC" | "OPEN_ENDED";
  phase: "core" | "extended";
}

export type AnswerMap = Record<number, boolean | number | string>;

interface OnboardingFlowProps {
  questions: QuestionData[];
  onCoreComplete: (answers: AnswerMap) => void;
  onExtendedComplete: (answers: AnswerMap) => void;
  onSkipExtended: () => void;
}

export function OnboardingFlow({
  questions,
  onCoreComplete,
  onExtendedComplete,
  onSkipExtended,
}: OnboardingFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [phase, setPhase] = useState<"core" | "decide" | "extended">(
    "core",
  );

  const coreQuestions = questions.filter((q) => q.phase === "core");
  const extendedQuestions = questions.filter(
    (q) => q.phase === "extended",
  );

  const activeQuestions =
    phase === "extended" ? extendedQuestions : coreQuestions;
  const question = activeQuestions[currentIndex];

  const handleAnswer = useCallback(
    (questionId: number, value: boolean | number | string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));

      const nextIndex = currentIndex + 1;

      if (nextIndex >= activeQuestions.length) {
        if (phase === "core") {
          const coreAnswers = { ...answers, [questionId]: value };
          onCoreComplete(coreAnswers);
          setPhase("decide");
        } else if (phase === "extended") {
          onExtendedComplete({ ...answers, [questionId]: value });
        }
      } else {
        setCurrentIndex(nextIndex);
      }
    },
    [currentIndex, activeQuestions, phase, answers, onCoreComplete, onExtendedComplete],
  );

  const handleStartExtended = () => {
    setPhase("extended");
    setCurrentIndex(0);
  };

  if (phase === "decide") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <h2 className="text-2xl font-bold">
          Thought Map이 생성되었습니다!
        </h2>
        <p className="text-center text-gray-600">
          5개 추가 질문에 답하면 더 정확한 프로필을 만들 수 있어요.
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleStartExtended}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            확장 질문 시작
          </button>
          <button
            type="button"
            onClick={onSkipExtended}
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            지금은 건너뛸게요
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col gap-8 py-4">
      <ProgressBar
        current={currentIndex + 1}
        total={activeQuestions.length}
        phase={phase === "extended" ? "extended" : "core"}
      />

      <div className="min-h-[200px]">
        {question.type === "OX" && (
          <OxQuestion
            questionId={question.id}
            text={question.text}
            onAnswer={handleAnswer}
            selected={
              answers[question.id] as boolean | undefined ?? null
            }
          />
        )}
        {question.type === "RUBRIC" && (
          <RubricQuestion
            questionId={question.id}
            text={question.text}
            onAnswer={handleAnswer}
            selected={
              answers[question.id] as number | undefined ?? null
            }
          />
        )}
        {question.type === "OPEN_ENDED" && (
          <OpenEndedQuestion
            questionId={question.id}
            text={question.text}
            onAnswer={handleAnswer}
            initialValue={
              (answers[question.id] as string) ?? ""
            }
          />
        )}
      </div>
    </div>
  );
}
