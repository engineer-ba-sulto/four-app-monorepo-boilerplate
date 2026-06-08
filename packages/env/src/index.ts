import { appEnvSchema } from "@repo/schema";
import { z } from "zod";

export const commonEnvSchema = z.object({
  APP_ENV: appEnvSchema.default("development"),
  PUBLIC_SITE_URL: z.string().url(),
  PUBLIC_APP_URL: z.string().url(),
  PUBLIC_API_URL: z.string().url(),
  PUBLIC_APP_NAME: z.string().min(1),
  PUBLIC_SUPPORT_EMAIL: z.string().email(),
});

export type CommonEnv = z.infer<typeof commonEnvSchema>;

export function parseCommonEnv(
  input: Record<string, string | undefined>,
): CommonEnv {
  return commonEnvSchema.parse(input);
}

export const commonEnvDefaults: CommonEnv = {
  APP_ENV: "development",
  PUBLIC_SITE_URL: "https://example.com",
  PUBLIC_APP_URL: "https://app.example.com",
  PUBLIC_API_URL: "https://api.example.com",
  PUBLIC_APP_NAME: "My App",
  PUBLIC_SUPPORT_EMAIL: "support@example.com",
};
