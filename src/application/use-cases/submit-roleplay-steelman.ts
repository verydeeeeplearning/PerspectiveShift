import { RoleplaySteelman } from "@/domain/value-objects/roleplay-steelman";

interface SubmitRoleplayInput {
  oppositeRolePrompt: string;
  userResponse: string | null;
  isSkipped: boolean;
}

interface SubmitRoleplayResult {
  isSkipped: boolean;
  userResponse: string | null;
}

export class SubmitRoleplaySteelmanUseCase {
  execute(input: SubmitRoleplayInput): SubmitRoleplayResult {
    const base = RoleplaySteelman.create({
      oppositeRolePrompt: input.oppositeRolePrompt,
    });

    const result = input.isSkipped
      ? base.skip()
      : input.userResponse
        ? base.complete(input.userResponse)
        : base.skip();

    return {
      isSkipped: result.isSkipped,
      userResponse: result.userResponse,
    };
  }
}
