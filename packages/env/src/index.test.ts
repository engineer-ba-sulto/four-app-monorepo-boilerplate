import { describe, expect, test } from "bun:test";

import { commonEnvDefaults, parseCommonEnv } from "./index.ts";

describe("parseCommonEnv", () => {
  test("parses valid common env", () => {
    const result = parseCommonEnv({
      APP_ENV: "development",
      PUBLIC_SITE_URL: "https://example.com",
      PUBLIC_APP_URL: "https://app.example.com",
      PUBLIC_API_URL: "https://api.example.com",
      PUBLIC_APP_NAME: "My App",
      PUBLIC_SUPPORT_EMAIL: "support@example.com",
    });

    expect(result.PUBLIC_APP_NAME).toBe("My App");
    expect(result.APP_ENV).toBe("development");
  });

  test("defaults APP_ENV when omitted", () => {
    const result = parseCommonEnv({
      PUBLIC_SITE_URL: commonEnvDefaults.PUBLIC_SITE_URL,
      PUBLIC_APP_URL: commonEnvDefaults.PUBLIC_APP_URL,
      PUBLIC_API_URL: commonEnvDefaults.PUBLIC_API_URL,
      PUBLIC_APP_NAME: commonEnvDefaults.PUBLIC_APP_NAME,
      PUBLIC_SUPPORT_EMAIL: commonEnvDefaults.PUBLIC_SUPPORT_EMAIL,
    });

    expect(result.APP_ENV).toBe("development");
  });

  test("rejects invalid email", () => {
    expect(() =>
      parseCommonEnv({
        ...commonEnvDefaults,
        PUBLIC_SUPPORT_EMAIL: "not-an-email",
      }),
    ).toThrow();
  });
});
