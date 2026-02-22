import { NextResponse } from "next/server";
import { z } from "zod";
import { getContainer } from "@/infrastructure/config/di-container";
import { GenerateNextBatchUseCase } from "@/application/use-cases/generate-next-batch";
import { DynamicQuestionBank, type SeedQuestion } from "@/domain/entities/dynamic-question-bank";
import type { PreviousAnswer } from "@/domain/interfaces/question-generator";

const NextBatchRequestSchema = z.object({
  sessionId: z.string().min(1),
  batchIndex: z.number().int().min(0),
  targetTotal: z.number().int().min(10).max(50),
  seeds: z.array(
    z.object({
      id: z.number().int(),
      text: z.string(),
      type: z.enum(["OX", "RUBRIC", "OPEN_ENDED"]),
      dimension: z.string(),
      polarity: z.union([z.literal(1), z.literal(-1)]),
    }),
  ),
  previousBatches: z.array(
    z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        type: z.enum(["OX", "RUBRIC"]),
        dimension: z.string(),
        polarity: z.union([z.literal(1), z.literal(-1)]),
        batchIndex: z.number().int(),
      }),
    ),
  ).optional().default([]),
  previousAnswers: z.array(
    z.object({
      questionId: z.string(),
      questionText: z.string(),
      answerSummary: z.string(),
    }),
  ).optional().default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = NextBatchRequestSchema.parse(body);

    const container = getContainer();
    const useCase = new GenerateNextBatchUseCase({
      piiScrubber: container.piiScrubber,
      questionGenerator: container.questionGenerator,
      fallbackGenerator: container.fallbackQuestionGenerator,
    });

    // Reconstruct DynamicQuestionBank from client state
    const seeds: SeedQuestion[] = input.seeds.map((s) => ({
      id: s.id,
      text: s.text,
      type: s.type as "OX" | "RUBRIC" | "OPEN_ENDED",
      dimension: s.dimension as import("@/domain/value-objects/stance-dimension").StanceDimension,
      polarity: s.polarity,
    }));

    const bank = DynamicQuestionBank.create(seeds, input.targetTotal);

    // Re-add previous batches to restore state
    for (const batch of input.previousBatches) {
      const { GeneratedQuestion } = await import("@/domain/value-objects/generated-question");
      const questions = batch.map((q, i) =>
        GeneratedQuestion.create({
          index: i,
          batchIndex: q.batchIndex,
          text: q.text,
          type: q.type as "OX" | "RUBRIC",
          dimension: q.dimension as import("@/domain/value-objects/stance-dimension").StanceDimension,
          polarity: q.polarity,
        }),
      );
      bank.addBatch(questions);
    }

    const previousAnswers: PreviousAnswer[] = input.previousAnswers;

    const result = await useCase.execute({
      bank,
      previousAnswers,
    });

    return NextResponse.json({
      success: true,
      batchIndex: result.batchIndex,
      questions: result.questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        dimension: q.dimension,
        polarity: q.polarity,
        batchIndex: q.batchIndex,
      })),
      isComplete: result.isComplete,
      usedFallback: result.usedFallback,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.message },
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      console.error("[next-batch] Failed to generate batch:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error("[next-batch] Failed to generate batch:", error);
    }
    return NextResponse.json(
      {
        error: "질문 생성 중 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 },
    );
  }
}
