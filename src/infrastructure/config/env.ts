import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  LANGCHAIN_TRACING_V2: z
    .enum(["true", "false"])
    .optional()
    .default("false"),
  LANGCHAIN_API_KEY: z.string().min(1).optional(),
  LANGCHAIN_PROJECT: z.string().optional().default("perspectiveshift"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:3000"),
  FEATURE_MATCHING: z
    .enum(["true", "false"])
    .optional()
    .default("true"),
  FEATURE_RELATIONSHIP: z
    .enum(["true", "false"])
    .optional()
    .default("false"),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(): Env {
  return EnvSchema.parse(process.env);
}

export function hasSupabaseConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function hasOpenAiConfig(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
