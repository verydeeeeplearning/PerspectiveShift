import { z } from "zod";

export const UpdateDisclosureInputSchema = z.object({
  friendshipId: z.string().uuid(),
  targetUserId: z.string().uuid(),
  level: z.number().int().min(0).max(3),
});

export type UpdateDisclosureInput = z.infer<
  typeof UpdateDisclosureInputSchema
>;

export const GetDisclosureLevelsInputSchema = z.object({
  friendshipId: z.string().uuid(),
});

export type GetDisclosureLevelsInput = z.infer<
  typeof GetDisclosureLevelsInputSchema
>;
