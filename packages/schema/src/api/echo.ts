import { z } from "zod";

export const echoRequestSchema = z.object({
  message: z.string().min(1),
});

export const echoResponseSchema = z.object({
  message: z.string(),
  echoed: z.literal(true),
});

export type EchoRequest = z.infer<typeof echoRequestSchema>;
export type EchoResponse = z.infer<typeof echoResponseSchema>;
