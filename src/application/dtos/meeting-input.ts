import { z } from "zod";

export const CreateOfflineProposalInputSchema = z.object({
  friendshipId: z.string().uuid(),
  proposedAt: z.string().datetime().optional(),
  locationHint: z.string().max(200).optional(),
});

export type CreateOfflineProposalInput = z.infer<
  typeof CreateOfflineProposalInputSchema
>;

export const RespondToOfflineProposalInputSchema = z.object({
  action: z.enum(["confirm", "cancel"]),
});

export type RespondToOfflineProposalInput = z.infer<
  typeof RespondToOfflineProposalInputSchema
>;

export const SubmitSafetyCheckinInputSchema = z.object({
  status: z.enum(["SAFE", "CONCERN", "NO_RESPONSE"]),
});

export type SubmitSafetyCheckinInput = z.infer<
  typeof SubmitSafetyCheckinInputSchema
>;
