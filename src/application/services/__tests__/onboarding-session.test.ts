import { describe, it, expect } from "vitest";
import { OnboardingSession } from "../onboarding-session";
import { Answer } from "@/domain/entities/answer";

describe("OnboardingSession", () => {
  it("starts in core phase with question 1", () => {
    const session = new OnboardingSession("sess-1");
    const state = session.getState();
    expect(state.phase).toBe("core");
    expect(state.currentQuestion).toBe(1);
    expect(state.answers).toHaveLength(0);
  });

  describe("addAnswer", () => {
    it("adds answer and advances question", () => {
      const session = new OnboardingSession("sess-1");
      session.addAnswer(Answer.ox(1, true));
      const state = session.getState();
      expect(state.answers).toHaveLength(1);
      expect(state.currentQuestion).toBe(2);
    });

    it("replaces answer for same question", () => {
      const session = new OnboardingSession("sess-1");
      session.addAnswer(Answer.ox(1, true));
      session.addAnswer(Answer.ox(1, false));
      const state = session.getState();
      expect(state.answers).toHaveLength(1);
      expect(state.answers[0].value).toBe(false);
    });
  });

  describe("isCoreComplete", () => {
    it("returns false with partial answers", () => {
      const session = new OnboardingSession("sess-1");
      session.addAnswer(Answer.ox(1, true));
      session.addAnswer(Answer.ox(2, false));
      expect(session.isCoreComplete()).toBe(false);
    });

    it("returns true with all 5 core answers", () => {
      const session = new OnboardingSession("sess-1");
      session.addAnswer(Answer.ox(1, true));
      session.addAnswer(Answer.ox(2, false));
      session.addAnswer(Answer.ox(3, true));
      session.addAnswer(Answer.rubric(4, 3));
      session.addAnswer(Answer.rubric(5, 4));
      expect(session.isCoreComplete()).toBe(true);
    });
  });

  describe("phase transitions", () => {
    function completeCoreSession(): OnboardingSession {
      const session = new OnboardingSession("sess-1");
      session.addAnswer(Answer.ox(1, true));
      session.addAnswer(Answer.ox(2, false));
      session.addAnswer(Answer.ox(3, true));
      session.addAnswer(Answer.rubric(4, 3));
      session.addAnswer(Answer.rubric(5, 4));
      return session;
    }

    it("transitions to initial_result", () => {
      const session = completeCoreSession();
      session.transitionToInitialResult();
      expect(session.getState().phase).toBe("initial_result");
    });

    it("throws on initial_result if core incomplete", () => {
      const session = new OnboardingSession("sess-1");
      session.addAnswer(Answer.ox(1, true));
      expect(() => session.transitionToInitialResult()).toThrow();
    });

    it("transitions to extended", () => {
      const session = completeCoreSession();
      session.transitionToInitialResult();
      session.transitionToExtended();
      expect(session.getState().phase).toBe("extended");
      expect(session.getState().currentQuestion).toBe(6);
    });

    it("transitions to complete with initial precision", () => {
      const session = completeCoreSession();
      session.transitionToComplete();
      expect(session.getState().phase).toBe("complete");
      expect(session.getState().precision).toBe("initial");
    });

    it("transitions to complete with refined precision", () => {
      const session = completeCoreSession();
      session.transitionToExtended();
      session.addAnswer(Answer.ox(6, true));
      session.addAnswer(Answer.rubric(7, 4));
      session.addAnswer(Answer.rubric(8, 2));
      session.addAnswer(Answer.openEnded(9, "답변 1"));
      session.addAnswer(Answer.openEnded(10, "답변 2"));
      session.transitionToComplete();
      expect(session.getState().precision).toBe("refined");
    });
  });

  describe("answer filtering", () => {
    it("getCoreAnswers returns only Q1-Q5", () => {
      const session = new OnboardingSession("sess-1");
      session.addAnswer(Answer.ox(1, true));
      session.addAnswer(Answer.ox(6, false));
      expect(session.getCoreAnswers()).toHaveLength(1);
    });

    it("getExtendedAnswers returns only Q6-Q10", () => {
      const session = new OnboardingSession("sess-1");
      session.addAnswer(Answer.ox(1, true));
      session.addAnswer(Answer.ox(6, false));
      expect(session.getExtendedAnswers()).toHaveLength(1);
    });

    it("getOpenEndedAnswers returns only open-ended", () => {
      const session = new OnboardingSession("sess-1");
      session.addAnswer(Answer.ox(1, true));
      session.addAnswer(Answer.openEnded(9, "text"));
      expect(session.getOpenEndedAnswers()).toHaveLength(1);
    });
  });
});
