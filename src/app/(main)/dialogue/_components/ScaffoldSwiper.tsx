"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CoachSuggestion } from "@/domain/value-objects/coach-suggestion";

interface ScaffoldSwiperProps {
  onSelect?: (template: string) => void;
  onCoachClick?: () => void;
}

const SWIPE_THRESHOLD = 50;

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export function ScaffoldSwiper({ onSelect, onCoachClick }: ScaffoldSwiperProps) {
  const suggestions = CoachSuggestion.all();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const navigateTo = useCallback(
    (newIndex: number, dir: number) => {
      setDirection(dir);
      setCurrentIndex(newIndex);
      window.dispatchEvent(
        new CustomEvent("scaffold_swipe", {
          detail: { index: newIndex, method: suggestions[newIndex].method },
        }),
      );
    },
    [suggestions],
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      const offsetX = info.offset.x;
      if (offsetX < -SWIPE_THRESHOLD && currentIndex < suggestions.length - 1) {
        navigateTo(currentIndex + 1, 1);
      } else if (offsetX > SWIPE_THRESHOLD && currentIndex > 0) {
        navigateTo(currentIndex - 1, -1);
      }
    },
    [currentIndex, suggestions.length, navigateTo],
  );

  const handleCardClick = useCallback(() => {
    const template = suggestions[currentIndex].template;
    window.dispatchEvent(
      new CustomEvent("scaffold_select", {
        detail: { index: currentIndex, method: suggestions[currentIndex].method },
      }),
    );
    onSelect?.(template);
  }, [currentIndex, suggestions, onSelect]);

  const handleCoachClick = useCallback(() => {
    window.dispatchEvent(new CustomEvent("coach_click"));
    onCoachClick?.();
  }, [onCoachClick]);

  const current = suggestions[currentIndex];

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="relative min-h-[80px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            aria-label={`${current.label}: ${current.template}`}
            className="cursor-pointer rounded-xl border bg-white p-4"
          >
            <p className="font-semibold">{current.label}</p>
            <p className="mt-1 text-sm text-gray-600">{current.template}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="mt-2 flex items-center justify-center gap-1.5" role="tablist" aria-label="카드 인디케이터">
        {suggestions.map((_, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={idx === currentIndex}
            aria-label={`카드 ${idx + 1}`}
            onClick={() => {
              const dir = idx > currentIndex ? 1 : -1;
              if (idx !== currentIndex) navigateTo(idx, dir);
            }}
            className={`h-2 w-2 rounded-full transition-colors ${
              idx === currentIndex ? "bg-blue-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Coach CTA */}
      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={handleCoachClick}
          className="rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
        >
          Coach
        </button>
      </div>
    </div>
  );
}
