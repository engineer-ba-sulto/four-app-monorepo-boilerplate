import { describe, expect, test } from "bun:test";

import { postEcho } from "./echo.ts";

describe("postEcho", () => {
  test("parses a successful echo response", async () => {
    const client = {
      echo: {
        $post: async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({
              message: "hello",
              echoed: true,
            }),
          }) as Response,
      },
    };

    const result = await postEcho(client, { message: "hello" });
    expect(result.message).toBe("hello");
    expect(result.echoed).toBe(true);
  });

  test("throws on non-ok response", async () => {
    const client = {
      echo: {
        $post: async () =>
          ({
            ok: false,
            status: 400,
            json: async () => ({}),
          }) as Response,
      },
    };

    await expect(postEcho(client, { message: "hello" })).rejects.toThrow(
      "Failed to post echo: 400",
    );
  });
});
