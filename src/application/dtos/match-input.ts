import { z } from "zod";

export const RequestMatchInputSchema = z.object({
  sessionId: z.string().uuid(),
});

export type RequestMatchInput = z.infer<typeof RequestMatchInputSchema>;

export const CreateProposalInputSchema = z.object({
  initiatorSessionId: z.string().uuid(),
  targetSessionId: z.string().uuid(),
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
