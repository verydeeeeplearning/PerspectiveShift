import { z } from "zod";

export const ClaimSessionInputSchema = z.object({
  sessionId: z.string().uuid(),
});

export type ClaimSessionInput = z.infer<typeof ClaimSessionInputSchema>;
