"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface DistanceLabelInfo {
  level: string;
  emoji: string;
  shortText: string;
  description: string;
  isDisabled: boolean;
}

interface MatchCardV3Props {
  topic: string;
  distanceLabel: DistanceLabelInfo;
  estimatedMinutes: number;
  difficultyRange?: [number, number];
  ctaLabel?: string;
  socialProof?: string;
  trailer?: string;
  onStart: () => void;
  onDecline: () => void;
}

export function MatchCardV3({
  topic,
  distanceLabel,
  estimatedMinutes,
  difficultyRange = [1, 2],
  ctaLabel = "대화 시작",
  socialProof,
  trailer,
  onStart,
  onDecline,
}: MatchCardV3Props) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionSignature = useMemo(
    () =>
      [
        estimatedMinutes,
        difficultyRange[0],
        difficultyRange[1],
        distanceLabel.level,
        ctaLabel,
      ].join("|"),
    [
      ctaLabel,
      difficultyRange[0],
      difficultyRange[1],
      distanceLabel.level,
      estimatedMinutes,
    ],
  );

  useEffect(() => {
    setIsTransitioning(true);
    const timer = window.setTimeout(() => setIsTransitioning(false), 300);
    return () => window.clearTimeout(timer);
  }, [transitionSignature]);

  return (
    <motion.div
      className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 ${
        isTransitioning ? "scale-[0.99] opacity-80" : "scale-100 opacity-100"
      }`}
      data-testid="match-card-root"
      data-transitioning={isTransitioning ? "true" : "false"}
      animate={{
        scale: isTransitioning ? 0.99 : 1,
        opacity: isTransitioning ? 0.8 : 1,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          TODAY&apos;S MATCH
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
          🔒 익명
        </span>
      </div>

      <h3 className="mb-3 text-xl font-bold text-gray-900">{topic}</h3>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{distanceLabel.emoji}</span>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {distanceLabel.shortText}
            </p>
            <p className="text-xs text-gray-500">
              {distanceLabel.description}
            </p>
          </div>
        </div>
        <div className="ml-auto text-right">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={`time-${estimatedMinutes}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-gray-900 transition-opacity duration-300"
              data-testid="match-card-time"
            >
              약 {estimatedMinutes}분
            </motion.p>
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={`difficulty-${difficultyRange[0]}-${difficultyRange[1]}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-gray-500 transition-opacity duration-300"
              data-testid="match-card-difficulty"
            >
              난이도 Level {difficultyRange[0]}-{difficultyRange[1]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {trailer && (
        <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3">
          <p className="text-sm leading-relaxed text-blue-800">
            {trailer}
          </p>
        </div>
      )}

      {socialProof && (
        <p className="mb-4 text-center text-xs text-gray-400">
          {socialProof}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onStart}
          aria-label={ctaLabel}
          className="flex-1 rounded-xl bg-blue-600 px-6 py-3 text-center font-bold text-white transition-colors hover:bg-blue-700"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={ctaLabel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="transition-opacity duration-300"
            >
              {ctaLabel}
            </motion.span>
          </AnimatePresence>{" "}
          →
        </button>
        <button
          type="button"
          onClick={onDecline}
          aria-label="다음에"
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50"
        >
          다음에
        </button>
      </div>
    </motion.div>
  );
}
