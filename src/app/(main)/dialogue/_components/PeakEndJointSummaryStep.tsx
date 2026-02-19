"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface PeakEndJointSummaryStepProps {
  summary: {
    topic: string;
    date: string;
    myKeyPoint: string;
    opponentKeyPoint: string;
    commonGround: string | null;
    newDiscovery: string | null;
    understandingScore: number;
    feelHeardScore: number;
  };
  onNext: () => void;
}

export function PeakEndJointSummaryStep({
  summary,
  onNext,
}: PeakEndJointSummaryStepProps) {
  const [isMerged, setIsMerged] = useState(false);

  useEffect(() => {
    setIsMerged(false);
    const timer = window.setTimeout(() => {
      setIsMerged(true);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div data-testid="step-joint-summary">
      <h3 className="mb-3 text-lg font-semibold">대화 요약</h3>
      <div
        data-testid="joint-summary-merge-animation"
        className="mb-3 overflow-hidden rounded-xl border border-sky-100 bg-sky-50 p-3"
      >
        <AnimatePresence mode="wait">
          {!isMerged ? (
            <motion.div
              key="split-cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-2"
            >
              <motion.div
                initial={{ x: -28, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="rounded-lg bg-white p-2 text-xs text-gray-700"
              >
                나의 요약
              </motion.div>
              <motion.div
                initial={{ x: 28, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="rounded-lg bg-white p-2 text-xs text-gray-700"
              >
                상대 요약
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="merged-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-lg bg-white p-3 text-center text-xs font-medium text-sky-800"
            >
              공동 요약 카드가 완성됐어요
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="space-y-3 rounded-xl border bg-white p-4">
        <div className="flex justify-between text-sm text-gray-500">
          <span>{summary.topic}</span>
          <span>{summary.date}</span>
        </div>
        <div className="space-y-2 text-sm">
          <p>나의 핵심 주장: &quot;{summary.myKeyPoint}&quot;</p>
          <p>상대의 핵심 주장: &quot;{summary.opponentKeyPoint}&quot;</p>
          {summary.commonGround && <p>공통점: &quot;{summary.commonGround}&quot;</p>}
          {summary.newDiscovery && <p>새로운 발견: &quot;{summary.newDiscovery}&quot;</p>}
        </div>
        <div className="flex gap-4 border-t pt-2 text-xs text-gray-500">
          <span>Understanding: {summary.understandingScore}</span>
          <span>Feel Heard: {summary.feelHeardScore}/5</span>
        </div>
      </div>
      <button
        className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-white"
        onClick={onNext}
      >
        다음
      </button>
    </div>
  );
}
