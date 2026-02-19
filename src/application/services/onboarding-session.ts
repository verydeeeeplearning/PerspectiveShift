import type { Answer } from "@/domain/entities/answer";

export type OnboardingPhase =
  | "warmup"
  | "core"
  | "initial_result"
  | "extended"
  | "complete";

export interface OnboardingSessionState {
  sessionId: string;
  phase: OnboardingPhase;
  currentQuestion: number;
  answers: Answer[];
  precision: "initial" | "refined";
}

export class OnboardingSession {
  private state: OnboardingSessionState;

  constructor(sessionId: string, startWithWarmup: boolean = false) {
    this.state = {
      sessionId,
      phase: startWithWarmup ? "warmup" : "core",
      currentQuestion: 1,
      answers: [],
      precision: "initial",
    };
  }

  transitionFromWarmupToCore(): void {
    if (this.state.phase !== "warmup") {
      throw new Error("Can only transition from warmup to core");
    }
    this.state.phase = "core";
  }

  skipWarmup(): void {
    this.transitionFromWarmupToCore();
  }

  getState(): Readonly<OnboardingSessionState> {
    return { ...this.state, answers: [...this.state.answers] };
  }

  addAnswer(answer: Answer): void {
    const existing = this.state.answers.findIndex(
      (a) => a.questionId === answer.questionId,
    );
    if (existing >= 0) {
      this.state.answers[existing] = answer;
    } else {
      this.state.answers.push(answer);
    }
    this.advanceQuestion();
  }

  getCoreAnswers(): Answer[] {
    return this.state.answers.filter((a) => a.questionId <= 5);
  }

  getExtendedAnswers(): Answer[] {
    return this.state.answers.filter((a) => a.questionId > 5);
  }

  getOpenEndedAnswers(): Answer[] {
    return this.state.answers.filter((a) => a.isOpenEnded());
  }

  isCoreComplete(): boolean {
    return this.getCoreAnswers().length >= 5;
  }

  isExtendedComplete(): boolean {
    return this.getExtendedAnswers().length >= 5;
  }

  transitionToInitialResult(): void {
    if (!this.isCoreComplete()) {
      throw new Error("Core questions not complete");
    }
    this.state.phase = "initial_result";
  }

  transitionToExtended(): void {
    this.state.phase = "extended";
    this.state.currentQuestion = 6;
  }

  transitionToComplete(): void {
    this.state.phase = "complete";
    this.state.precision = this.isExtendedComplete()
      ? "refined"
      : "initial";
  }

  private advanceQuestion(): void {
    const maxAnswered = Math.max(
      ...this.state.answers.map((a) => a.questionId),
    );
    this.state.currentQuestion = Math.min(maxAnswered + 1, 10);
  }
}
