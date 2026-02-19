/** Sheet, card morph, layout transitions */
export const springSoft = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
  mass: 0.9,
};

/** Button press, toggle, quick feedback */
export const springSnappy = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.7,
};

/** Number count, progress bar */
export const springGentle = {
  type: "spring" as const,
  stiffness: 180,
  damping: 24,
  mass: 1.0,
};

/** Reduce-motion fallback config */
export const reducedMotion = {
  floating: false,
  sheet: { opacity: 1, y: 0 },
  number: "instant" as const,
};
