import type { Hono } from "hono";
import { hc } from "hono/client";

export function createApiClient<T extends Hono>(baseUrl: string) {
  return hc<T>(baseUrl);
}

export type ApiClient<T extends Hono> = ReturnType<typeof createApiClient<T>>;
