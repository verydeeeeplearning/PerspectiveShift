import { Answer } from "@/domain/entities/answer";
import { SubmitAnswerInputSchema } from "../dtos/submit-answer-input";
import type { SubmitAnswerInput } from "../dtos/submit-answer-input";
import type { OnboardingSession } from "../services/onboarding-session";

export class SubmitAnswerUseCase {
  execute(session: OnboardingSession, rawInput: unknown): Answer {
    const input = SubmitAnswerInputSchema.parse(
      rawInput,
    ) as SubmitAnswerInput;

    const answer = this.createAnswer(input);
    session.addAnswer(answer);
    return answer;
  }

  private createAnswer(input: SubmitAnswerInput): Answer {
    switch (input.type) {
      case "OX":
        return Answer.ox(input.questionId, input.value);
      case "RUBRIC":
        return Answer.rubric(input.questionId, input.value);
      case "OPEN_ENDED":
        return Answer.openEnded(input.questionId, input.value);
    }
  }
}
