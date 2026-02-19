import { z } from "zod";

export const RequestFriendshipInputSchema = z.object({
  targetId: z.string().uuid(),
  dialogueSessionId: z.string().uuid().optional(),
});

export type RequestFriendshipInput = z.infer<
  typeof RequestFriendshipInputSchema
>;

export const RespondToFriendRequestInputSchema = z.object({
  requestId: z.string().uuid(),
  action: z.enum(["accept", "decline", "silent_reject"]),
});

export type RespondToFriendRequestInput = z.infer<
  typeof RespondToFriendRequestInputSchema
>;
