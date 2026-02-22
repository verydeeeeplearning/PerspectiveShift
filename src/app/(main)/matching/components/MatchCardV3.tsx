"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { springSnappy, springSoft } from "@/app/_shared/motion";

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
      className="rounded-card border border-border-soft bg-surface-card p-6 shadow-card"
      data-testid="match-card-root"
      data-transitioning={isTransitioning ? "true" : "false"}
      animate={{
        scale: isTransitioning ? 0.99 : 1,
        opacity: isTransitioning ? 0.85 : 1,
      }}
      transition={springSoft}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-accent-primary">
          입장 기반 추천
        </span>
        <span className="rounded-pill bg-accent-primary-soft px-2.5 py-0.5 text-[11px] font-medium text-text-secondary">
          🔒 익명
        </span>
      </div>

      {/* Topic */}
      <h3 className="mb-4 text-xl font-bold font-heading text-text-primary tracking-[-0.02em]">
        {topic}
      </h3>

      {/* Distance + Time info */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{distanceLabel.emoji}</span>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {distanceLabel.shortText}
            </p>
            <p className="text-xs text-text-secondary">
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
              className="text-sm font-medium text-text-primary num"
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
              className="text-xs text-text-secondary num"
              data-testid="match-card-difficulty"
            >
              난이도 Level {difficultyRange[0]}-{difficultyRange[1]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Trailer */}
      {trailer && (
        <div className="mb-4 rounded-input bg-accent-primary-soft px-4 py-3">
          <p className="text-sm leading-relaxed text-text-primary">
            {trailer}
          </p>
        </div>
      )}

      {/* Social proof */}
      {socialProof && (
        <p className="mb-4 text-center text-xs text-text-tertiary">
          {socialProof}
        </p>
      )}

      {/* CTA Buttons */}
      <div className="flex gap-3">
        <motion.button
          type="button"
          onClick={onStart}
          aria-label={ctaLabel}
          className="flex-1 rounded-pill gradient-cta px-6 py-3 text-center font-bold text-text-inverse shadow-cta"
          whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(44, 62, 80, 0.2)" }}
          whileTap={{ scale: 0.96 }}
          transition={springSnappy}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={ctaLabel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {ctaLabel}
            </motion.span>
          </AnimatePresence>
          {" →"}
        </motion.button>
        <motion.button
          type="button"
          onClick={onDecline}
          aria-label="다음에"
          className="rounded-pill border border-border-soft px-4 py-3 text-sm text-text-secondary hover:bg-accent-primary-soft transition-colors"
          whileTap={{ scale: 0.96 }}
          transition={springSnappy}
        >
          다음에
        </motion.button>
      </div>
    </motion.div>
  );
}
