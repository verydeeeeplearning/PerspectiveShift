"use client";

import { useCallback, useRef, useState } from "react";
import type { AnswerMap, QuestionData } from "./onboarding-flow.helpers";

export interface GeneratedQuestionMeta {
  id: string;
  text: string;
  type: "OX" | "RUBRIC";
  dimension: string;
  polarity: 1 | -1;
  batchIndex: number;
}

export interface SeedQuestionMeta {
  id: number;
  text: string;
  type: "OX" | "RUBRIC" | "OPEN_ENDED";
  dimension: string;
  polarity: 1 | -1;
}

export interface BatchResponse {
  success: boolean;
  batchIndex: number;
  questions: GeneratedQuestionMeta[];
  isComplete: boolean;
  usedFallback: boolean;
}

interface UseBatchLoaderParams {
  seedMeta: SeedQuestionMeta[];
  targetTotal: number;
  answers: AnswerMap;
  allQuestions: QuestionData[];
  generatedBatches: GeneratedQuestionMeta[][];
}

export function useBatchLoader({
  seedMeta,
  targetTotal,
  answers,
  allQuestions,
  generatedBatches,
}: UseBatchLoaderParams) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefetchedRef = useRef<BatchResponse | null>(null);
  const prefetchingRef = useRef(false);

  const fetchBatch = useCallback(
    async (batchIndex: number): Promise<BatchResponse> => {
      const previousAnswers = Object.entries(answers).map(([qId, value]) => {
        const q = allQuestions.find(
          (question) => String(question.id) === String(qId),
        );
        return {
          questionId: String(qId),
          questionText: q?.text ?? "",
          answerSummary: String(value),
        };
      });

      const previousBatches = generatedBatches.map((batch) =>
        batch.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          dimension: q.dimension,
          polarity: q.polarity,
          batchIndex: q.batchIndex,
        })),
      );

      const response = await fetch("/api/onboarding/next-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "dynamic-session",
          batchIndex,
          targetTotal,
          seeds: seedMeta,
          previousBatches,
          previousAnswers,
        }),
      });

      if (!response.ok) {
        let message = `Batch generation failed: ${response.status}`;
        try {
          const body = await response.json() as {
            error?: string;
            details?: string;
          };
          if (typeof body.error === "string" && body.error.length > 0) {
            message = body.error;
          } else if (
            typeof body.details === "string" &&
            body.details.length > 0
          ) {
            message = body.details;
          }
        } catch {
          // Ignore JSON parse failures and keep status-based message.
        }
        throw new Error(message);
      }

      return response.json();
    },
    [answers, allQuestions, generatedBatches, seedMeta, targetTotal],
  );

  const load = useCallback(
    async (
      onSuccess: (result: BatchResponse) => void,
    ) => {
      const nextBatchIndex = generatedBatches.length;
      setLoading(true);
      setError(null);

      try {
        let result: BatchResponse;
        if (prefetchedRef.current?.batchIndex === nextBatchIndex) {
          result = prefetchedRef.current;
          prefetchedRef.current = null;
        } else {
          result = await fetchBatch(nextBatchIndex);
        }
        onSuccess(result);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "질문 생성에 실패했습니다",
        );
        setLoading(false);
      }
    },
    [fetchBatch, generatedBatches.length],
  );

  const prefetch = useCallback(async () => {
    if (prefetchingRef.current || prefetchedRef.current) return;
    const nextBatchIndex = generatedBatches.length;
    prefetchingRef.current = true;
    try {
      const result = await fetchBatch(nextBatchIndex);
      prefetchedRef.current = result;
    } catch {
      // Prefetch failure is non-critical
    } finally {
      prefetchingRef.current = false;
    }
  }, [fetchBatch, generatedBatches.length]);

  const clearPrefetch = useCallback(() => {
    prefetchedRef.current = null;
  }, []);

  return { loading, error, load, prefetch, clearPrefetch };
}
