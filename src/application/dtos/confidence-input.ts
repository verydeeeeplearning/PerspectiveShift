import { z } from "zod";
import { StanceDimension } from "@/domain/value-objects/stance-dimension";

const dimensionValues = Object.values(StanceDimension) as [string, ...string[]];

export const SubmitConfidenceInputSchema = z.object({
  sessionId: z.string().min(1),
  highConfidenceDimensions: z.array(z.enum(dimensionValues)).min(0).max(6),
});

export type SubmitConfidenceInput = z.infer<typeof SubmitConfidenceInputSchema>;
