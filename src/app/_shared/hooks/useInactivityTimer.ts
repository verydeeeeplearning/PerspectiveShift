"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Tracks user inactivity. Returns `true` after `ms` milliseconds
 * of no interaction events (keydown, pointerdown, scroll).
 * Resets on any interaction.
 */
export function useInactivityTimer(ms: number): boolean {
  const [inactive, setInactive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setInactive(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setInactive(true), ms);
  }, [ms]);

  useEffect(() => {
    reset();
    const events: (keyof WindowEventMap)[] = ["keydown", "pointerdown", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [reset]);

  return inactive;
}
