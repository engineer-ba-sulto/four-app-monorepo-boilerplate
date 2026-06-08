import { describe, expect, test } from "bun:test";

import { echoResponseSchema, statusResponseSchema } from "@repo/schema";

import { app } from "./app.ts";

const mockEnv = {
  APP_ENV: "test",
  PUBLIC_SITE_URL: "https://example.com",
  PUBLIC_APP_URL: "https://app.example.com",
  PUBLIC_API_URL: "https://api.example.com",
  PUBLIC_APP_NAME: "My App",
  PUBLIC_SUPPORT_EMAIL: "support@example.com",
  ASSETS: {} as Fetcher,
} satisfies CloudflareBindings;

describe("GET /health", () => {
  test("returns ok", async () => {
    const response = await app.request("/health", {}, mockEnv);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });
});

describe("GET /status", () => {
  test("returns a valid status payload", async () => {
    const response = await app.request("/status", {}, mockEnv);
    expect(response.status).toBe(200);

    const body = statusResponseSchema.parse(await response.json());
    expect(body.status).toBe("ok");
    expect(body.app).toBe("api");
    expect(body.version).toBe("0.0.0");
    expect(body.env).toBe("test");
  });
});

describe("POST /echo", () => {
  test("echoes the message", async () => {
    const response = await app.request(
      "/echo",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "hello" }),
      },
      mockEnv,
    );

    expect(response.status).toBe(200);

    const body = echoResponseSchema.parse(await response.json());
    expect(body).toEqual({ message: "hello", echoed: true });
  });

  test("rejects an empty message", async () => {
    const response = await app.request(
      "/echo",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "" }),
      },
      mockEnv,
    );

    expect(response.status).toBe(400);
  });
});
