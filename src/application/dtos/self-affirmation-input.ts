import { z } from "zod";
import { CORE_VALUES, type CoreValueKey } from "@/domain/value-objects/core-value";

const validCoreValues = Object.keys(CORE_VALUES) as [CoreValueKey, ...CoreValueKey[]];

export const SubmitSelfAffirmationInputSchema = z.object({
  sessionId: z.string().min(1),
  coreValue: z.enum(validCoreValues),
  experience: z.string().max(500).optional(),
});

export type SubmitSelfAffirmationInput = z.infer<
  typeof SubmitSelfAffirmationInputSchema
>;
