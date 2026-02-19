import { ReflectionQuiz } from "@/domain/entities/reflection-quiz";

interface GenerateQuizInput {
  dialogueId: string;
  opponentKeyPoint: string;
}

interface GenerateQuizResult {
  dialogueId: string;
  options: readonly string[];
  correctIndex: number;
}

export class GenerateReflectionQuizUseCase {
  execute(input: GenerateQuizInput): GenerateQuizResult {
    // In production, LLM generates distractors. Here we create deterministic distractors.
    const correct = input.opponentKeyPoint;
    const distractors = [
      "경제적 효율성이 가장 중요하다",
      "개인의 자유가 우선이다",
      "사회적 합의가 필요하다",
    ];
    const correctIndex = 0;
    const options = [correct, ...distractors];

    const quiz = ReflectionQuiz.create({
      options,
      correctIndex,
      dialogueId: input.dialogueId,
    });

    return {
      dialogueId: quiz.dialogueId,
      options: quiz.options,
      correctIndex: quiz.correctIndex,
    };
  }
}
