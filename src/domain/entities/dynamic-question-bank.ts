import type { StanceDimension } from "../value-objects/stance-dimension";
import { ALL_DIMENSIONS } from "../value-objects/stance-dimension";
import type { GeneratedQuestion } from "../value-objects/generated-question";
import type { QuestionType } from "../value-objects/question-type";

export interface SeedQuestion {
  id: number;
  text: string;
  type: QuestionType;
  dimension: StanceDimension;
  polarity: 1 | -1;
}

export interface DimensionCoverage {
  dimension: StanceDimension;
  questionCount: number;
  ratio: number;
}

export class DynamicQuestionBank {
  private readonly _seeds: ReadonlyArray<SeedQuestion>;
  private readonly _batches: GeneratedQuestion[][];
  private readonly _targetTotal: number;

  private constructor(
    seeds: SeedQuestion[],
    targetTotal: number,
  ) {
    this._seeds = Object.freeze([...seeds]);
    this._batches = [];
    this._targetTotal = targetTotal;
  }

  static create(seeds: SeedQuestion[], targetTotal: number): DynamicQuestionBank {
    return new DynamicQuestionBank(seeds, targetTotal);
  }

  get seeds(): ReadonlyArray<SeedQuestion> {
    return this._seeds;
  }

  get batchCount(): number {
    return this._batches.length;
  }

  get totalQuestionCount(): number {
    return this._seeds.length + this.generatedQuestionCount;
  }

  get generatedQuestionCount(): number {
    return this._batches.reduce((sum, batch) => sum + batch.length, 0);
  }

  get targetTotal(): number {
    return this._targetTotal;
  }

  get remainingCount(): number {
    return Math.max(0, this._targetTotal - this.totalQuestionCount);
  }

  isComplete(): boolean {
    return this.totalQuestionCount >= this._targetTotal;
  }

  addBatch(batch: GeneratedQuestion[]): void {
    this._batches.push([...batch]);
  }

  getGeneratedQuestions(): GeneratedQuestion[] {
    return this._batches.flat();
  }

  getBatch(batchIndex: number): GeneratedQuestion[] {
    return this._batches[batchIndex] ? [...this._batches[batchIndex]] : [];
  }

  getDimensionCoverage(): DimensionCoverage[] {
    const counts: Record<string, number> = {};
    for (const dim of ALL_DIMENSIONS) {
      counts[dim] = 0;
    }

    for (const seed of this._seeds) {
      counts[seed.dimension] = (counts[seed.dimension] || 0) + 1;
    }

    for (const question of this.getGeneratedQuestions()) {
      counts[question.dimension] = (counts[question.dimension] || 0) + 1;
    }

    const total = this.totalQuestionCount || 1;

    return ALL_DIMENSIONS.map((dim) => ({
      dimension: dim,
      questionCount: counts[dim] || 0,
      ratio: (counts[dim] || 0) / total,
    }));
  }

  getUncoveredDimensions(): StanceDimension[] {
    const coverage = this.getDimensionCoverage();
    const avgRatio = 1 / ALL_DIMENSIONS.length;
    return coverage
      .filter((c) => c.ratio < avgRatio * 0.5)
      .map((c) => c.dimension);
  }

  getAllQuestionIds(): string[] {
    const seedIds = this._seeds.map((s) => String(s.id));
    const genIds = this.getGeneratedQuestions().map((q) => q.id);
    return [...seedIds, ...genIds];
  }
}
