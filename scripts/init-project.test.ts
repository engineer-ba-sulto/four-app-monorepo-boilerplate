import { describe, expect, test } from "bun:test";
import {
  appPackageName,
  ensureAppDevScriptUsesPathFilter,
  renameWorkspaceDependencyKeys,
  replacePackageImports,
  slugToDisplayName,
  updateAppPackageJson,
  updateExpoAppJson,
  validateProjectSlug,
  workerName,
} from "./init-project";

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

describe("appPackageName", () => {
  test("uses worker names for api, web, and lp", () => {
    expect(appPackageName("my-cool-app", "api")).toBe("my-cool-app-api");
    expect(appPackageName("my-cool-app", "web")).toBe("my-cool-app-web");
    expect(appPackageName("my-cool-app", "lp")).toBe("my-cool-app-lp");
  });

  test("uses project slug for sp", () => {
    expect(appPackageName("my-cool-app", "sp")).toBe("my-cool-app");
  });
});

describe("slugToDisplayName", () => {
  test("converts kebab-case to title case", () => {
    expect(slugToDisplayName("my-cool-app")).toBe("My Cool App");
  });
});

describe("updateAppPackageJson", () => {
  test("renames default api package name", () => {
    const packageJson = { name: "api" };
    expect(
      updateAppPackageJson(
        packageJson,
        "api",
        "four-app-monorepo-boilerplate",
        "my-cool-app",
      ),
    ).toBe(true);
    expect(packageJson.name).toBe("my-cool-app-api");
  });

  test("renames default sp package name", () => {
    const packageJson = { name: "sp" };
    expect(
      updateAppPackageJson(
        packageJson,
        "sp",
        "four-app-monorepo-boilerplate",
        "my-cool-app",
      ),
    ).toBe(true);
    expect(packageJson.name).toBe("my-cool-app");
  });

  test("renames package that already matches old slug", () => {
    const packageJson = { name: "my-old-app-web" };
    expect(
      updateAppPackageJson(packageJson, "web", "my-old-app", "my-cool-app"),
    ).toBe(true);
    expect(packageJson.name).toBe("my-cool-app-web");
  });

  test("skips custom package names", () => {
    const packageJson = { name: "custom-mobile" };
    expect(
      updateAppPackageJson(packageJson, "sp", "my-old-app", "my-cool-app"),
    ).toBe(false);
    expect(packageJson.name).toBe("custom-mobile");
  });
});

describe("ensureAppDevScriptUsesPathFilter", () => {
  test("rewrites dev scripts to path-based filters", () => {
    const scripts = {
      "dev:api": "bun run --filter api dev",
      "dev:web": "bun run --filter web dev",
      "dev:sp": "bun run --filter sp dev",
      "dev:lp": "bun run --filter lp dev",
    };

    expect(ensureAppDevScriptUsesPathFilter(scripts, "api")).toBe(true);
    expect(ensureAppDevScriptUsesPathFilter(scripts, "web")).toBe(true);
    expect(ensureAppDevScriptUsesPathFilter(scripts, "sp")).toBe(true);
    expect(ensureAppDevScriptUsesPathFilter(scripts, "lp")).toBe(true);
    expect(scripts["dev:api"]).toBe("bun run --filter ./apps/api dev");
    expect(scripts["dev:web"]).toBe("bun run --filter ./apps/web dev");
    expect(scripts["dev:sp"]).toBe("bun run --filter ./apps/sp dev");
    expect(scripts["dev:lp"]).toBe("bun run --filter ./apps/lp dev");
  });
});

describe("renameWorkspaceDependencyKeys", () => {
  test("renames dependency keys using rename map", () => {
    const packageJson = {
      name: "web",
      dependencies: {
        api: "workspace:*",
        "@repo/env": "workspace:*",
      },
    };
    const renameMap = new Map([["api", "my-cool-app-api"]]);

    expect(renameWorkspaceDependencyKeys(packageJson, renameMap)).toBe(true);
    expect(packageJson.dependencies).toEqual({
      "my-cool-app-api": "workspace:*",
      "@repo/env": "workspace:*",
    });
  });
});

describe("replacePackageImports", () => {
  test("updates import specifiers for renamed workspace packages", () => {
    const content = `import type { AppType } from "api/app";\nimport { x } from 'api/app';`;

    expect(replacePackageImports(content, "api", "my-cool-app-api")).toBe(
      `import type { AppType } from "my-cool-app-api/app";\nimport { x } from 'my-cool-app-api/app';`,
    );
  });
});

describe("updateExpoAppJson", () => {
  test("updates default expo fields", () => {
    const appJson = {
      expo: {
        name: "sp",
        slug: "sp",
        scheme: "sp",
      },
    };

    expect(
      updateExpoAppJson(
        appJson,
        "four-app-monorepo-boilerplate",
        "my-cool-app",
      ),
    ).toBe(true);
    expect(appJson.expo.slug).toBe("my-cool-app");
    expect(appJson.expo.name).toBe("My Cool App");
    expect(appJson.expo.scheme).toBe("my-cool-app");
  });

  test("updates fields that already match old slug", () => {
    const appJson = {
      expo: {
        name: "My Old App",
        slug: "my-old-app",
        scheme: "my-old-app",
      },
    };

    expect(updateExpoAppJson(appJson, "my-old-app", "my-cool-app")).toBe(true);
    expect(appJson.expo.slug).toBe("my-cool-app");
    expect(appJson.expo.name).toBe("My Cool App");
    expect(appJson.expo.scheme).toBe("my-cool-app");
  });
});
