import { DomainError } from "../errors/domain-errors";
import { QuestionItem } from "../value-objects/question-item";
import { ONBOARDING_MODES, type OnboardingModeKey } from "../value-objects/onboarding-mode";

export class InsufficientAnchorQuestionsError extends DomainError {
  constructor(count: number) {
    super(`At least 5 anchor questions required, got ${count}`);
  }
}

const MIN_ANCHOR_COUNT = 5;
const CORE_ANCHOR_COUNT = 5;

export class QuestionBank {
  private readonly _anchors: ReadonlyArray<QuestionItem>;
  private readonly _rotating: ReadonlyArray<QuestionItem>;

  private constructor(anchors: QuestionItem[], rotating: QuestionItem[]) {
    this._anchors = Object.freeze([...anchors]);
    this._rotating = Object.freeze([...rotating]);
  }

  static create(questions: QuestionItem[]): QuestionBank {
    const anchors = questions.filter((q) => q.isAnchor);
    const rotating = questions.filter((q) => !q.isAnchor);

    if (anchors.length < MIN_ANCHOR_COUNT) {
      throw new InsufficientAnchorQuestionsError(anchors.length);
    }

    return new QuestionBank(anchors, rotating);
  }

  get anchorCount(): number {
    return this._anchors.length;
  }

  get rotatingCount(): number {
    return this._rotating.length;
  }

  sampleForMode(mode: OnboardingModeKey): QuestionItem[] {
    const targetCount = ONBOARDING_MODES[mode].questionCount;

    if (mode === "QUICK") {
      // QUICK mode: core 5 anchors only
      return this._anchors.slice(0, CORE_ANCHOR_COUNT);
    }

    // STANDARD/PRECISE: all anchors + rotating fill
    const result: QuestionItem[] = [...this._anchors];
    const remaining = targetCount - result.length;

    if (remaining > 0) {
      const sampled = this.shuffleSample(this._rotating, remaining);
      result.push(...sampled);
    }

    return result.slice(0, targetCount);
  }

  sampleExtension(
    additionalCount: number,
    excludeIds: ReadonlySet<string>,
  ): QuestionItem[] {
    const available = [
      ...this._anchors.filter((q) => !excludeIds.has(q.id)),
      ...this._rotating.filter((q) => !excludeIds.has(q.id)),
    ];

    return this.shuffleSample(available, additionalCount);
  }

  private shuffleSample(
    items: ReadonlyArray<QuestionItem>,
    count: number,
  ): QuestionItem[] {
    const shuffled = [...items];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }
}
