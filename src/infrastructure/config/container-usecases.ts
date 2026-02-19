import type { CoreDependencies } from "./container-core";
import { createCoreUseCases } from "./container-usecases-core";
import { createExtendedUseCases } from "./container-usecases-extended";

export function createUseCases(deps: CoreDependencies) {
  return {
    ...createCoreUseCases(deps),
    ...createExtendedUseCases(deps),
  };
}
