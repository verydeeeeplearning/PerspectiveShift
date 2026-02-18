import { z } from "zod";

export const SubmitTurnInputSchema = z.object({
  sessionId: z.string().uuid(),
  participantId: z.string().uuid(),
  content: z.string().min(10).max(3000),
});

export type SubmitTurnInput = z.infer<typeof SubmitTurnInputSchema>;
