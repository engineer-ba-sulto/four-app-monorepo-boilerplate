import { commonEnvDefaults, parseCommonEnv } from "@repo/env";

export function getSpEnv() {
  return parseCommonEnv({
    APP_ENV: process.env.EXPO_PUBLIC_APP_ENV ?? commonEnvDefaults.APP_ENV,
    PUBLIC_SITE_URL:
      process.env.EXPO_PUBLIC_SITE_URL ?? commonEnvDefaults.PUBLIC_SITE_URL,
    PUBLIC_APP_URL:
      process.env.EXPO_PUBLIC_APP_URL ?? commonEnvDefaults.PUBLIC_APP_URL,
    PUBLIC_API_URL:
      process.env.EXPO_PUBLIC_API_URL ?? commonEnvDefaults.PUBLIC_API_URL,
    PUBLIC_APP_NAME:
      process.env.EXPO_PUBLIC_APP_NAME ?? commonEnvDefaults.PUBLIC_APP_NAME,
    PUBLIC_SUPPORT_EMAIL:
      process.env.EXPO_PUBLIC_SUPPORT_EMAIL ??
      commonEnvDefaults.PUBLIC_SUPPORT_EMAIL,
  });
}
