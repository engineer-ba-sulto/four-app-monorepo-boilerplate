import { describe, expect, test } from "bun:test";

import { echoRequestSchema, echoResponseSchema } from "./echo.ts";

describe("echo schemas", () => {
  test("parses echo request", () => {
    const result = echoRequestSchema.parse({ message: "hello" });
    expect(result.message).toBe("hello");
  });

  test("parses echo response", () => {
    const result = echoResponseSchema.parse({
      message: "hello",
      echoed: true,
    });
    expect(result.echoed).toBe(true);
  });

  test("rejects empty message", () => {
    expect(() => echoRequestSchema.parse({ message: "" })).toThrow();
  });
});
