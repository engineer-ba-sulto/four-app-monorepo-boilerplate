import { describe, expect, test } from "bun:test";

import { statusResponseSchema } from "./status.ts";

describe("statusResponseSchema", () => {
  test("parses a valid status response", () => {
    const result = statusResponseSchema.parse({
      status: "ok",
      app: "api",
      version: "0.0.0",
      env: "development",
      timestamp: "2026-06-07T00:00:00.000Z",
    });

    expect(result.status).toBe("ok");
    expect(result.app).toBe("api");
  });

  test("rejects invalid status", () => {
    expect(() =>
      statusResponseSchema.parse({
        status: "error",
        app: "api",
        version: "0.0.0",
        env: "development",
        timestamp: "2026-06-07T00:00:00.000Z",
      }),
    ).toThrow();
  });
});
