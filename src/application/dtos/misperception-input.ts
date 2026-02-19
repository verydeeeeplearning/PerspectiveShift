import { z } from "zod";
import { StanceDimension } from "@/domain/value-objects/stance-dimension";

const dimensionValues = Object.values(StanceDimension) as [string, ...string[]];

export const MisperceptionInputSchema = z.object({
  sessionId: z.string().min(1),
  dimension: z.enum(dimensionValues),
  prediction: z.number().min(-1).max(1),
});

export type MisperceptionInput = z.infer<typeof MisperceptionInputSchema>;
