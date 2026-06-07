import { commonEnvDefaults, parseCommonEnv } from "@repo/env";

export function getWebEnv() {
  return parseCommonEnv({
    APP_ENV: import.meta.env.APP_ENV ?? commonEnvDefaults.APP_ENV,
    PUBLIC_SITE_URL:
      import.meta.env.PUBLIC_SITE_URL ?? commonEnvDefaults.PUBLIC_SITE_URL,
    PUBLIC_APP_URL:
      import.meta.env.PUBLIC_APP_URL ?? commonEnvDefaults.PUBLIC_APP_URL,
    PUBLIC_API_URL:
      import.meta.env.PUBLIC_API_URL ?? commonEnvDefaults.PUBLIC_API_URL,
    PUBLIC_APP_NAME:
      import.meta.env.PUBLIC_APP_NAME ?? commonEnvDefaults.PUBLIC_APP_NAME,
    PUBLIC_SUPPORT_EMAIL:
      import.meta.env.PUBLIC_SUPPORT_EMAIL ??
      commonEnvDefaults.PUBLIC_SUPPORT_EMAIL,
  });
}
