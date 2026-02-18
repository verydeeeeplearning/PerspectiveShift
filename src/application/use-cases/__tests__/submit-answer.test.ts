import { describe, it, expect } from "vitest";
import { SubmitAnswerUseCase } from "../submit-answer";
import { OnboardingSession } from "../../services/onboarding-session";

describe("SubmitAnswerUseCase", () => {
  const useCase = new SubmitAnswerUseCase();

  it("submits OX answer and adds to session", () => {
    const session = new OnboardingSession("sess-1");
    const answer = useCase.execute(session, {
      questionId: 1,
      type: "OX",
      value: true,
    });

    expect(answer.questionId).toBe(1);
    expect(answer.value).toBe(true);
    expect(session.getState().answers).toHaveLength(1);
  });

  it("submits RUBRIC answer", () => {
    const session = new OnboardingSession("sess-1");
    const answer = useCase.execute(session, {
      questionId: 4,
      type: "RUBRIC",
      value: 4,
    });
    expect(answer.value).toBe(4);
  });

  it("submits OPEN_ENDED answer", () => {
    const session = new OnboardingSession("sess-1");
    const answer = useCase.execute(session, {
      questionId: 9,
      type: "OPEN_ENDED",
      value: "한국 사회에서 가장 시급한 문제는...",
    });
    expect(answer.isOpenEnded()).toBe(true);
  });

  it("rejects invalid input", () => {
    const session = new OnboardingSession("sess-1");
    expect(() =>
      useCase.execute(session, {
        questionId: 99,
        type: "OX",
        value: true,
      }),
    ).toThrow();
  });

  it("rejects missing type", () => {
    const session = new OnboardingSession("sess-1");
    expect(() =>
      useCase.execute(session, {
        questionId: 1,
        value: true,
      }),
    ).toThrow();
  });
});
