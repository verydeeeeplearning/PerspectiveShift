export interface JitaiSignal {
  energy: number;
  idleSeconds: number;
  deleteCount: number;
  consecutiveToneChecks: number;
  feelHeardScore: number;
  highlightCount: number;
  quoteCount: number;
  hasReport: boolean;
  turnCount: number;
  currentStep: string;
}

export function normalizeJitaiSignal(
  signal: Partial<JitaiSignal> & Pick<JitaiSignal, "energy">,
): JitaiSignal {
  return {
    energy: signal.energy,
    idleSeconds: signal.idleSeconds ?? 0,
    deleteCount: signal.deleteCount ?? 0,
    consecutiveToneChecks: signal.consecutiveToneChecks ?? 0,
    feelHeardScore: signal.feelHeardScore ?? 3,
    highlightCount: signal.highlightCount ?? 0,
    quoteCount: signal.quoteCount ?? 0,
    hasReport: signal.hasReport ?? false,
    turnCount: signal.turnCount ?? 0,
    currentStep: signal.currentStep ?? "",
  };
}
