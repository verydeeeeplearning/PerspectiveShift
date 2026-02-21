import type {
  QuestionGenerator,
  QuestionGenerationContext,
  GeneratedQuestionBatch,
  GeneratedQuestionData,
} from "@/domain/interfaces/question-generator";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import expandedQuestions from "./data/expanded-questions.json";

interface ExpandedQuestion {
  id: number;
  text: string;
  type: "OX" | "RUBRIC";
  dimension: string;
  polarity: 1 | -1;
}

export class FallbackQuestionGenerator implements QuestionGenerator {
  private pool: ExpandedQuestion[];

  constructor() {
    this.pool = expandedQuestions as ExpandedQuestion[];
  }

  async generate(
    context: QuestionGenerationContext,
  ): Promise<GeneratedQuestionBatch> {
    const excludeSet = new Set(context.excludeQuestionIds);

    // Filter to questions not already used
    let available = this.pool.filter(
      (q) => !excludeSet.has(String(q.id)),
    );

    // Prioritize target dimensions if specified
    if (context.targetDimensions.length > 0) {
      const targetSet = new Set<string>(context.targetDimensions);
      const targeted = available.filter((q) => targetSet.has(q.dimension));
      const others = available.filter((q) => !targetSet.has(q.dimension));
      available = [...targeted, ...others];
    }

    // Shuffle for variety
    const shuffled = this.shuffle(available);
    const selected = shuffled.slice(0, context.batchSize);

    const questions: GeneratedQuestionData[] = selected.map((q) => ({
      text: q.text,
      type: q.type,
      dimension: q.dimension as StanceDimension,
      polarity: q.polarity,
    }));

    return {
      questions,
      batchIndex: context.batchIndex,
    };
  }

  private shuffle<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
