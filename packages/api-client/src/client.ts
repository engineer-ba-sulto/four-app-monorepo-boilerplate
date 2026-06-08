import type { Hono } from "hono";
import { hc } from "hono/client";

// biome-ignore lint/suspicious/noExplicitAny: API apps may declare custom Hono env bindings.
type AnyHono = Hono<any, any, any>;

export function createApiClient<T extends AnyHono>(baseUrl: string) {
  return hc<T>(baseUrl);
}

export type ApiClient<T extends AnyHono> = ReturnType<
  typeof createApiClient<T>
>;
