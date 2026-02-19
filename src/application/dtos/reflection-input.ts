import { z } from "zod";
import { REFLECTION_TYPES } from "@/domain/value-objects/reflection-item";

const reflectionTypeValues = [...REFLECTION_TYPES] as [string, ...string[]];

export const SubmitReflectionInputSchema = z.object({
  sessionId: z.string().min(1),
  participantId: z.string().min(1),
  items: z.array(
    z.object({
      type: z.enum(reflectionTypeValues),
      content: z.string(),
    }),
  ).min(1),
});

export type SubmitReflectionInput = z.infer<typeof SubmitReflectionInputSchema>;
