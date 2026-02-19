import { z } from "zod";

export const SubmitReportInputSchema = z.object({
  reportedId: z.string().uuid(),
  reason: z.enum([
    "HARASSMENT",
    "THREAT",
    "PII_REQUEST",
    "IMPERSONATION",
    "OTHER",
  ]),
  description: z.string().max(1000).optional(),
});

export type SubmitReportInput = z.infer<typeof SubmitReportInputSchema>;

export const BlockUserInputSchema = z.object({
  blockedId: z.string().uuid(),
});

export type BlockUserInput = z.infer<typeof BlockUserInputSchema>;
