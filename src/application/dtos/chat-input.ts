import { z } from "zod";

export const SendMessageInputSchema = z.object({
  friendshipId: z.string().uuid(),
  content: z.string().min(1).max(2000),
});

export type SendMessageInput = z.infer<typeof SendMessageInputSchema>;

export const MarkReadInputSchema = z.object({
  friendshipId: z.string().uuid(),
  messageIds: z.array(z.string().uuid()).min(1),
});

export type MarkReadInput = z.infer<typeof MarkReadInputSchema>;
