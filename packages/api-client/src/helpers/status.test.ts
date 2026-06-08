import { describe, expect, test } from "bun:test";

import { fetchStatus } from "./status.ts";

describe("fetchStatus", () => {
  test("parses a successful status response", async () => {
    const client = {
      status: {
        $get: async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({
              status: "ok",
              app: "api",
              version: "0.0.0",
              env: "development",
              timestamp: "2026-06-07T00:00:00.000Z",
            }),
          }) as Response,
      },
    };

    const result = await fetchStatus(client);
    expect(result.status).toBe("ok");
    expect(result.app).toBe("api");
  });

  test("throws on non-ok response", async () => {
    const client = {
      status: {
        $get: async () =>
          ({
            ok: false,
            status: 500,
            json: async () => ({}),
          }) as Response,
      },
    };

    await expect(fetchStatus(client)).rejects.toThrow(
      "Failed to fetch status: 500",
    );
  });
});
