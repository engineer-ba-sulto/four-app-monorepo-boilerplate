import { describe, expect, test } from "bun:test";
import { validateProjectSlug, workerName } from "./init-project";

describe("validateProjectSlug", () => {
  test("accepts kebab-case slugs", () => {
    expect(() => validateProjectSlug("my-cool-app")).not.toThrow();
  });

  test("rejects uppercase", () => {
    expect(() => validateProjectSlug("My-App")).toThrow(/Invalid slug/);
  });

  test("rejects spaces", () => {
    expect(() => validateProjectSlug("my app")).toThrow(/Invalid slug/);
  });
});

describe("workerName", () => {
  test("builds Cloudflare worker names", () => {
    expect(workerName("my-cool-app", "api")).toBe("my-cool-app-api");
    expect(workerName("my-cool-app", "web")).toBe("my-cool-app-web");
    expect(workerName("my-cool-app", "lp")).toBe("my-cool-app-lp");
  });
});
