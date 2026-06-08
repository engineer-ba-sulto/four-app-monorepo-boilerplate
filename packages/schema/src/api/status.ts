import { z } from "zod";

import { appEnvSchema } from "../common/app-env.ts";

export const statusResponseSchema = z.object({
  status: z.literal("ok"),
  app: z.string().min(1),
  version: z.string().min(1),
  env: appEnvSchema,
  timestamp: z.string().datetime(),
});

export type StatusResponse = z.infer<typeof statusResponseSchema>;
