import { z } from "zod";

export const appEnvSchema = z.enum([
  "development",
  "staging",
  "production",
  "test",
]);

export type AppEnv = z.infer<typeof appEnvSchema>;
