"use client";

import { useState, useCallback, useMemo } from "react";
import {
  type PeakEndStepType,
  PEAK_END_STEPS,
} from "@/domain/value-objects/peak-end-step";
import {
  determineFinalCTA,
  getCTALabel,
  type FinalCTAContext,
} from "@/domain/value-objects/final-cta-type";
import { TuringTestPanel } from "./TuringTestPanel";
import { PeakEndJointSummaryStep } from "./PeakEndJointSummaryStep";

type TuringSide = "human" | "ai";

interface TuringGuessResult {
  actual: TuringSide;
  isCorrect: boolean;
  rewards: Array<{ type: string; message: string }>;
}

interface PeakEndFlowProps {
  // Joint Summary data
  summary: {
    topic: string;
    date: string;
    myKeyPoint: string;
    opponentKeyPoint: string;
    commonGround: string | null;
    newDiscovery: string | null;
    understandingScore: number;
    feelHeardScore: number;
    agreedPoints: string[];
    disagreedPoints: string[];
  };
  // Gift message
  giftMessage?: { text: string; writtenAtStep: string } | null;
  // Blind spot
  blindSpot?: { discoveredConcept: string } | null;
  // Context for CTA
  ctaContext: FinalCTAContext;
  // Callbacks
  onKPISubmit: (feelHeard: number, rematchIntent: number) => void;
  onNextQuestionSave: (question: string) => void;
  onCTAClick: (ctaType: string) => void;
  onTuringGuess?: (guess: TuringSide) => Promise<TuringGuessResult> | TuringGuessResult;
}

export function PeakEndFlow({
  summary,
  giftMessage,
  blindSpot,
  ctaContext,
  onKPISubmit,
  onNextQuestionSave,
  onCTAClick,
  onTuringGuess,
}: PeakEndFlowProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [feelHeard, setFeelHeard] = useState(50);
  const [rematchIntent, setRematchIntent] = useState(50);
  const [nextQuestion, setNextQuestion] = useState("");

  const activeSteps = useMemo(
    () =>
      ctaContext.isAgentDialogue
        ? PEAK_END_STEPS
        : PEAK_END_STEPS.filter((step) => step !== "TURING_TEST"),
    [ctaContext.isAgentDialogue],
  );

  const currentStep: PeakEndStepType | "COMPLETE" =
    stepIndex < activeSteps.length
      ? activeSteps[stepIndex]
      : "COMPLETE";

  const handleNext = useCallback(() => {
    if (currentStep === "KPI_COLLECTION") {
      onKPISubmit(feelHeard, rematchIntent);
    }
    if (currentStep === "NEXT_QUESTION" && nextQuestion.trim()) {
      onNextQuestionSave(nextQuestion);
    }
    setStepIndex((prev) => prev + 1);
  }, [
    currentStep,
    feelHeard,
    rematchIntent,
    nextQuestion,
    onKPISubmit,
    onNextQuestionSave,
  ]);

  const cta = determineFinalCTA(ctaContext);
  const ctaLabel = getCTALabel(cta);

  return (
    <div className="space-y-6 p-4" role="region" aria-label="대화 마무리">
      {/* Progress */}
      <div className="h-1 w-full rounded-full bg-gray-200">
        <div
          className="h-1 rounded-full bg-blue-500 transition-all"
          style={{
            width: `${(stepIndex / activeSteps.length) * 100}%`,
          }}
        />
      </div>

      {/* Step Content */}
      {currentStep === "JOINT_SUMMARY" && (
        <PeakEndJointSummaryStep summary={summary} onNext={handleNext} />
      )}

      {currentStep === "TURING_TEST" && (
        <div data-testid="step-turing">
          <TuringTestPanel onSubmitGuess={onTuringGuess} />
          <button
            className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-white"
            onClick={handleNext}
          >
            다음
          </button>
        </div>
      )}

      {currentStep === "GIFT_MESSAGE" && (
        <div data-testid="step-gift-message">
          <h3 className="mb-3 text-lg font-semibold">선물 한 문장</h3>
          {giftMessage ? (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm">
                &quot;{giftMessage.text}&quot;
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              선물 메시지가 없습니다
            </p>
          )}
          <button
            className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-white"
            onClick={handleNext}
          >
            다음
          </button>
        </div>
      )}

      {currentStep === "BLIND_SPOT" && (
        <div data-testid="step-blind-spot">
          <h3 className="mb-3 text-lg font-semibold">새로운 발견</h3>
          {blindSpot ? (
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
              <p className="text-sm">
                {blindSpot.discoveredConcept}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              이번 대화에서 새로운 발견이 없었어요
            </p>
          )}
          <button
            className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-white"
            onClick={handleNext}
          >
            다음
          </button>
        </div>
      )}

      {currentStep === "KPI_COLLECTION" && (
        <div data-testid="step-kpi">
          <h3 className="mb-3 text-lg font-semibold">대화는 어땠나요?</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                상대가 내 말을 잘 들어줬나요?
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={feelHeard}
                onChange={(e) => setFeelHeard(Number(e.target.value))}
                className="w-full"
                aria-label="Feel Heard"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                다시 대화하고 싶나요?
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={rematchIntent}
                onChange={(e) =>
                  setRematchIntent(Number(e.target.value))
                }
                className="w-full"
                aria-label="다시 대화 의향"
              />
            </div>
          </div>
          <button
            className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-white"
            onClick={handleNext}
          >
            다음
          </button>
        </div>
      )}

      {currentStep === "NEXT_QUESTION" && (
        <div data-testid="step-next-question">
          <h3 className="mb-3 text-lg font-semibold">
            다음에 물어보고 싶은 질문
          </h3>
          <textarea
            value={nextQuestion}
            onChange={(e) => setNextQuestion(e.target.value)}
            placeholder="다음 대화에서 물어보고 싶은 질문을 적어주세요"
            className="min-h-[80px] w-full rounded-xl border p-3 text-sm"
            aria-label="다음 질문"
          />
          <button
            className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-white"
            onClick={handleNext}
          >
            {nextQuestion.trim() ? "저장하고 다음" : "건너뛰기"}
          </button>
        </div>
      )}

      {currentStep === "FINAL_CTA" && (
        <div
          data-testid="step-final-cta"
          className="space-y-4 text-center"
        >
          <h3 className="text-lg font-semibold">대화가 끝났어요!</h3>
          <button
            className="w-full rounded-xl bg-blue-600 py-3 text-lg font-medium text-white"
            onClick={() => onCTAClick(cta)}
          >
            {ctaLabel}
          </button>
        </div>
      )}
    </div>
  );
}
