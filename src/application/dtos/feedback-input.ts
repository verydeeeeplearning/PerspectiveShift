import { z } from "zod";

export const SubmitFeedbackInputSchema = z.object({
  sessionId: z.string().uuid(),
  participantId: z.string().uuid(),
  satisfaction: z.number().int().min(1).max(5),
  rematchWillingness: z.boolean(),
  emotionCheckIn: z.string().max(500).nullable(),
});

export type SubmitFeedbackInput = z.infer<
  typeof SubmitFeedbackInputSchema
>;
