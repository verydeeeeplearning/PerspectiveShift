"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type TuringSide = "human" | "ai";

interface TuringGuessResult {
  actual: TuringSide;
  isCorrect: boolean;
  rewards: Array<{ type: string; message: string }>;
}

interface TuringTestPanelProps {
  actual?: TuringSide;
  onSubmitGuess?: (guess: TuringSide) => Promise<TuringGuessResult> | TuringGuessResult;
}

function buildDefaultResult(guess: TuringSide, actual: TuringSide): TuringGuessResult {
  const isCorrect = guess === actual;
  if (isCorrect) {
    return {
      actual,
      isCorrect,
      rewards: [{ type: "observer_badge", message: "관찰자 뱃지 +1" }],
    };
  }
  if (guess === "human" && actual === "ai") {
    return {
      actual,
      isCorrect,
      rewards: [{ type: "impressive_view", message: "인상적인 관점" }],
    };
  }
  return {
    actual,
    isCorrect,
    rewards: [{ type: "unexpected_view", message: "의외의 시각" }],
  };
}

export function TuringTestPanel({
  actual = "ai",
  onSubmitGuess,
}: TuringTestPanelProps) {
  const [result, setResult] = useState<TuringGuessResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGuess = async (guess: TuringSide) => {
    if (result || submitting) {
      return;
    }
    setSubmitting(true);
    try {
      const nextResult = onSubmitGuess
        ? await onSubmitGuess(guess)
        : buildDefaultResult(guess, actual);
      setResult(nextResult);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="step-turing-test" className="space-y-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
      <h3 className="text-base font-semibold text-violet-900">튜링 테스트</h3>
      <p className="text-sm text-violet-800">
        이 대화 상대는 사람이었을까요, AI였을까요?
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={submitting || Boolean(result)}
          onClick={() => handleGuess("human")}
          className="rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-medium text-violet-900 disabled:opacity-50"
        >
          사람
        </button>
        <button
          type="button"
          disabled={submitting || Boolean(result)}
          onClick={() => handleGuess("ai")}
          className="rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-medium text-violet-900 disabled:opacity-50"
        >
          AI
        </button>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="turing-result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2 rounded-lg bg-white p-3"
          >
            <p className="text-sm font-medium text-gray-900">
              결과: {result.actual === "human" ? "사람" : "AI"} ({result.isCorrect ? "정답" : "오답"})
            </p>
            <div className="flex flex-wrap gap-2">
              {result.rewards.map((reward) => (
                <motion.span
                  key={reward.type}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800"
                >
                  {reward.message}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
