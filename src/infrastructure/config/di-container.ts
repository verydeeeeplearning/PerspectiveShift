import { createCoreDependencies } from "./container-core";
import { createUseCases } from "./container-usecases";

function createContainer() {
  const core = createCoreDependencies();
  const useCases = createUseCases(core);
  return { ...core, ...useCases };
}

export type Container = ReturnType<typeof createContainer>;

const globalForContainer = globalThis as unknown as {
  __perspectiveShiftContainer?: Container;
};

export function getContainer(): Container {
  if (!globalForContainer.__perspectiveShiftContainer) {
    globalForContainer.__perspectiveShiftContainer = createContainer();
  }
  return globalForContainer.__perspectiveShiftContainer;
}

export function resetContainer(): void {
  globalForContainer.__perspectiveShiftContainer = undefined;
}

// Reset container on HMR so use case changes are picked up in dev
if (process.env.NODE_ENV !== "production") {
  resetContainer();
}
