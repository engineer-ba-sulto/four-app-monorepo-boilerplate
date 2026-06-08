import { commonEnvDefaults, parseCommonEnv } from "@repo/env";
import {
  echoRequestSchema,
  echoResponseSchema,
  statusResponseSchema,
} from "@repo/schema";
import { Hono } from "hono";
import { cors } from "hono/cors";

const APP_VERSION = "0.0.0";

function resolveEnv(bindings: CloudflareBindings) {
  return parseCommonEnv({
    APP_ENV: bindings.APP_ENV ?? commonEnvDefaults.APP_ENV,
    PUBLIC_SITE_URL:
      bindings.PUBLIC_SITE_URL ?? commonEnvDefaults.PUBLIC_SITE_URL,
    PUBLIC_APP_URL: bindings.PUBLIC_APP_URL ?? commonEnvDefaults.PUBLIC_APP_URL,
    PUBLIC_API_URL: bindings.PUBLIC_API_URL ?? commonEnvDefaults.PUBLIC_API_URL,
    PUBLIC_APP_NAME:
      bindings.PUBLIC_APP_NAME ?? commonEnvDefaults.PUBLIC_APP_NAME,
    PUBLIC_SUPPORT_EMAIL:
      bindings.PUBLIC_SUPPORT_EMAIL ?? commonEnvDefaults.PUBLIC_SUPPORT_EMAIL,
  });
}

export const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(
  "*",
  cors({
    origin: (origin) => origin,
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.get("/status", (c) => {
  const env = resolveEnv(c.env);
  const payload = statusResponseSchema.parse({
    status: "ok",
    app: "api",
    version: APP_VERSION,
    env: env.APP_ENV,
    timestamp: new Date().toISOString(),
  });

  return c.json(payload);
});

app.post("/echo", async (c) => {
  const parsed = echoRequestSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const payload = echoResponseSchema.parse({
    message: parsed.data.message,
    echoed: true,
  });

  return c.json(payload);
});

export type AppType = typeof app;
