import { createCoreDependencies } from "./container-core";
import { createUseCases } from "./container-usecases";

function createContainer() {
  const core = createCoreDependencies();
  const useCases = createUseCases(core);
  return { ...core, ...useCases };
}

export type Container = ReturnType<typeof createContainer>;

let container: Container | null = null;

export function getContainer(): Container {
  if (!container) {
    container = createContainer();
  }
  return container;
}

export function resetContainer(): void {
  container = null;
}
