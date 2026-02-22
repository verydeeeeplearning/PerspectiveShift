import { OxQuestion } from "./OxQuestion";
import { RubricQuestion, type RubricAnswerValue } from "./RubricQuestion";
import { OpenEndedQuestion } from "./OpenEndedQuestion";
import type { AnswerMap, QuestionData } from "./onboarding-flow.helpers";

interface OnboardingQuestionRendererProps {
  question: QuestionData;
  answers: AnswerMap;
  onAnswer: (
    questionId: number | string,
    value: boolean | RubricAnswerValue | string,
  ) => void;
  onCoachClick: () => void;
  onExampleSwipe: () => void;
}

export function OnboardingQuestionRenderer({
  question,
  answers,
  onAnswer,
  onCoachClick,
  onExampleSwipe,
}: OnboardingQuestionRendererProps) {
  if (question.type === "OX") {
    return (
      <OxQuestion
        key={String(question.id)}
        questionId={question.id}
        text={question.text}
        onAnswer={onAnswer}
        selected={(answers[question.id] as boolean | undefined) ?? null}
      />
    );
  }

  if (question.type === "RUBRIC") {
    return (
      <RubricQuestion
        key={String(question.id)}
        questionId={question.id}
        text={question.text}
        onAnswer={onAnswer}
        selected={(answers[question.id] as RubricAnswerValue | undefined) ?? null}
        allowUncertain={question.allowUncertain}
        tooltipText={question.tooltipText}
      />
    );
  }

  return (
    <OpenEndedQuestion
      key={String(question.id)}
      questionId={question.id}
      text={question.text}
      onAnswer={onAnswer}
      initialValue={(answers[question.id] as string) ?? ""}
      tooltipText={question.tooltipText}
      onCoachClick={onCoachClick}
      onExampleSwipe={onExampleSwipe}
    />
  );
}
