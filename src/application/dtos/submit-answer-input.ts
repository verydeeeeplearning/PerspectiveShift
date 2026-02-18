import { z } from "zod";

export const OxAnswerSchema = z.object({
  questionId: z.number().int().min(1).max(10),
  type: z.literal("OX"),
  value: z.boolean(),
});

export const RubricAnswerSchema = z.object({
  questionId: z.number().int().min(1).max(10),
  type: z.literal("RUBRIC"),
  value: z.number().int().min(1).max(5),
});

export const OpenEndedAnswerSchema = z.object({
  questionId: z.number().int().min(1).max(10),
  type: z.literal("OPEN_ENDED"),
  value: z.string().min(1).max(2000),
});

export const SubmitAnswerInputSchema = z.discriminatedUnion("type", [
  OxAnswerSchema,
  RubricAnswerSchema,
  OpenEndedAnswerSchema,
]);

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerInputSchema>;

export const SubmitBatchInputSchema = z.object({
  sessionId: z.string().min(1),
  answers: z.array(SubmitAnswerInputSchema).min(1).max(10),
});

export type SubmitBatchInput = z.infer<typeof SubmitBatchInputSchema>;
