import { ReflectionQuiz } from "@/domain/entities/reflection-quiz";
import type { SummaryGenerator } from "@/domain/interfaces/summary-generator";

interface GenerateQuizInput {
  dialogueId: string;
  opponentKeyPoint: string;
}

interface GenerateQuizResult {
  dialogueId: string;
  options: readonly string[];
  correctIndex: number;
}

interface GenerateReflectionQuizDeps {
  summaryGenerator?: SummaryGenerator;
}

export class GenerateReflectionQuizUseCase {
  private readonly summaryGenerator?: SummaryGenerator;

  constructor(deps?: GenerateReflectionQuizDeps) {
    this.summaryGenerator = deps?.summaryGenerator;
  }

  async execute(input: GenerateQuizInput): Promise<GenerateQuizResult> {
    const correct = input.opponentKeyPoint;
    const distractors = [
      "경제적 효율성이 가장 중요하다",
      "개인의 자유가 우선이다",
      "사회적 합의가 필요하다",
    ];

    const allOptions = [correct, ...distractors];
    // Shuffle to randomize correct answer position
    const shuffled = [...allOptions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const correctIndex = shuffled.indexOf(correct);

    const quiz = ReflectionQuiz.create({
      options: shuffled,
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
