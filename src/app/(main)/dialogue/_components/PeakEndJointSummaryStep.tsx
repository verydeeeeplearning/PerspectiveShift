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

function truncate(text: string, max = 40): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "\u2026";
}

function MergeParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    return {
      x: Math.cos(angle) * 60,
      y: Math.sin(angle) * 60,
      delay: i * 0.03,
    };
  });

  return (
    <div
      data-testid="merge-particles"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-sky-300"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: 1, opacity: 0 }}
          transition={{ duration: 0.6, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function PeakEndJointSummaryStep({
  summary,
  onNext,
}: PeakEndJointSummaryStepProps) {
  const [isMerged, setIsMerged] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    setIsMerged(false);
    setShowParticles(false);
    const timer = window.setTimeout(() => {
      setIsMerged(true);
      setShowParticles(true);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showParticles) return;
    const timer = window.setTimeout(() => {
      setShowParticles(false);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [showParticles]);

  return (
    <div data-testid="step-joint-summary">
      <h3 className="mb-3 text-lg font-semibold">대화 요약</h3>
      <div
        data-testid="joint-summary-merge-animation"
        className="relative mb-3 overflow-hidden rounded-xl border border-sky-100 bg-sky-50 p-3"
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
                data-testid="split-card-mine"
                initial={{ x: -120, opacity: 0, rotate: -3 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-lg bg-white p-2 text-xs text-gray-700"
              >
                {truncate(summary.myKeyPoint)}
              </motion.div>
              <motion.div
                data-testid="split-card-opponent"
                initial={{ x: 120, opacity: 0, rotate: 3 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-lg bg-white p-2 text-xs text-gray-700"
              >
                {truncate(summary.opponentKeyPoint)}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="merged-card"
              data-testid="merged-card"
              initial={{
                scale: 0.9,
                opacity: 0,
                boxShadow: "0 0 0px rgba(56,189,248,0)",
              }}
              animate={{
                scale: [0.9, 1.05, 1],
                opacity: 1,
                boxShadow: [
                  "0 0 0px rgba(56,189,248,0)",
                  "0 0 20px rgba(56,189,248,0.4)",
                  "0 0 0px rgba(56,189,248,0)",
                ],
              }}
              transition={{
                scale: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
                boxShadow: { duration: 1.2, ease: "easeInOut" },
                opacity: { duration: 0.3 },
              }}
              className="rounded-lg bg-white p-3 text-center text-xs font-medium text-sky-800"
            >
              {summary.commonGround ?? "공동 요약 카드가 완성됐어요"}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showParticles && <MergeParticles />}
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
          {summary.commonGround && (
            <p>공통점: &quot;{summary.commonGround}&quot;</p>
          )}
          {summary.newDiscovery && (
            <p>새로운 발견: &quot;{summary.newDiscovery}&quot;</p>
          )}
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
