import { z } from "zod";

export const RequestMatchInputSchema = z.object({
  sessionId: z.string().uuid(),
  topicLevel: z.number().int().min(0).max(3).optional(),
  effortGrade: z.enum(["QUICK", "STRUCTURED", "DEEP"]).optional(),
  isFirstDialogue: z.boolean().optional(),
});

export type RequestMatchInput = z.infer<typeof RequestMatchInputSchema>;

export const CreateProposalInputSchema = z.object({
  initiatorSessionId: z.string().uuid(),
  targetSessionId: z.string().uuid(),
  topicLevel: z.number().int().min(0).max(3).optional(),
  effortGrade: z.enum(["QUICK", "STRUCTURED", "DEEP"]).optional(),
});

export type CreateProposalInput = z.infer<typeof CreateProposalInputSchema>;

export const RespondToProposalInputSchema = z.object({
  proposalId: z.string().uuid(),
  sessionId: z.string().uuid(),
  accept: z.boolean(),
});

export type RespondToProposalInput = z.infer<
  typeof RespondToProposalInputSchema
>;
