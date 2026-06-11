import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SLUG_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const WORKER_APPS = ["api", "web", "lp"] as const;
const APPS = ["api", "web", "lp", "sp"] as const;
const DEFAULT_SP_EXPO_SLUG = "sp";
const DEFAULT_SP_EXPO_NAME = "sp";
const DEFAULT_SP_EXPO_SCHEME = "sp";
const SOURCE_EXTENSIONS = [".ts", ".tsx"] as const;

export type WorkerApp = (typeof WORKER_APPS)[number];
export type AppName = (typeof APPS)[number];

type PackageJson = {
  name: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type ExpoAppJson = {
  expo: {
    name: string;
    slug: string;
    scheme: string;
    [key: string]: unknown;
  };
};

export function validateProjectSlug(slug: string): void {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      `Invalid slug "${slug}". Use lowercase kebab-case (e.g. my-cool-app).`,
    );
  }
}

export function workerName(slug: string, app: WorkerApp): string {
  return `${slug}-${app}`;
}

export function appPackageName(slug: string, app: AppName): string {
  if (app === "sp") {
    return slug;
  }

  return workerName(slug, app);
}

export function defaultAppPackageName(app: AppName): string {
  return app;
}

export function slugToDisplayName(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isRenamableAppPackageName(
  name: string,
  app: AppName,
  oldSlug: string,
): boolean {
  return (
    name === defaultAppPackageName(app) || name === appPackageName(oldSlug, app)
  );
}

export function updateAppPackageJson(
  packageJson: PackageJson,
  app: AppName,
  oldSlug: string,
  newSlug: string,
): boolean {
  if (!isRenamableAppPackageName(packageJson.name, app, oldSlug)) {
    return false;
  }

  packageJson.name = appPackageName(newSlug, app);
  return true;
}

export function ensureAppDevScriptUsesPathFilter(
  scripts: Record<string, string>,
  app: AppName,
): boolean {
  const scriptKey = `dev:${app}`;
  const devScript = scripts[scriptKey];
  const shortFilter = `--filter ${app}`;

  if (!devScript?.includes(shortFilter)) {
    return false;
  }

  scripts[scriptKey] = `bun run --filter ./apps/${app} dev`;
  return true;
}

export function renameWorkspaceDependencyKeys(
  packageJson: PackageJson,
  renameMap: Map<string, string>,
): boolean {
  let changed = false;

  for (const depField of ["dependencies", "devDependencies"] as const) {
    const deps = packageJson[depField];
    if (!deps) {
      continue;
    }

    for (const [oldName, newName] of renameMap) {
      if (!(oldName in deps)) {
        continue;
      }

      deps[newName] = deps[oldName];
      delete deps[oldName];
      changed = true;
    }
  }

  return changed;
}

export function replacePackageImports(
  content: string,
  oldPackageName: string,
  newPackageName: string,
): string {
  if (oldPackageName === newPackageName) {
    return content;
  }

  const fromDoubleQuote = new RegExp(
    `from "${escapeRegExp(oldPackageName)}/`,
    "g",
  );
  const fromSingleQuote = new RegExp(
    `from '${escapeRegExp(oldPackageName)}/`,
    "g",
  );

  return content
    .replace(fromDoubleQuote, `from "${newPackageName}/`)
    .replace(fromSingleQuote, `from '${newPackageName}/`);
}

export function updateExpoAppJson(
  appJson: ExpoAppJson,
  oldSlug: string,
  newSlug: string,
): boolean {
  const { expo } = appJson;
  let changed = false;

  if (
    expo.slug === oldSlug ||
    expo.slug === DEFAULT_SP_EXPO_SLUG ||
    expo.slug === defaultAppPackageName("sp")
  ) {
    expo.slug = newSlug;
    changed = true;
  }

  if (
    expo.name === oldSlug ||
    expo.name === slugToDisplayName(oldSlug) ||
    expo.name === DEFAULT_SP_EXPO_NAME ||
    expo.name === DEFAULT_SP_EXPO_SLUG
  ) {
    expo.name = slugToDisplayName(newSlug);
    changed = true;
  }

  if (
    expo.scheme === oldSlug ||
    expo.scheme === DEFAULT_SP_EXPO_SCHEME ||
    expo.scheme === defaultAppPackageName("sp")
  ) {
    expo.scheme = newSlug;
    changed = true;
  }

  return changed;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceWranglerName(
  content: string,
  oldSlug: string,
  newSlug: string,
  app: WorkerApp,
): string {
  const oldName = workerName(oldSlug, app);
  const newName = workerName(newSlug, app);
  const pattern = new RegExp(`"name":\\s*"${escapeRegExp(oldName)}"`);
  const next = content.replace(pattern, `"name": "${newName}"`);

  if (next === content) {
    throw new Error(
      `Could not update worker name in wrangler config (expected "${oldName}").`,
    );
  }

  return next;
}

function replaceReadmeTitle(
  content: string,
  oldSlug: string,
  newSlug: string,
): string {
  const pattern = new RegExp(`^# ${escapeRegExp(oldSlug)}`, "m");
  const next = content.replace(pattern, `# ${newSlug}`);

  if (next === content) {
    throw new Error(`Could not update README title (expected "# ${oldSlug}").`);
  }

  return next;
}

async function listFilesRecursively(
  directory: string,
  extensions: readonly string[],
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") {
        continue;
      }

      files.push(...(await listFilesRecursively(entryPath, extensions)));
      continue;
    }

    if (extensions.some((extension) => entry.name.endsWith(extension))) {
      files.push(entryPath);
    }
  }

  return files;
}

async function updateWorkspacePackageDependencies(
  root: string,
  renameMap: Map<string, string>,
): Promise<void> {
  const workspaceRoots = [join(root, "apps"), join(root, "packages")];

  for (const workspaceRoot of workspaceRoots) {
    const appDirs = await readdir(workspaceRoot, { withFileTypes: true });

    for (const appDir of appDirs) {
      if (!appDir.isDirectory()) {
        continue;
      }

      const packageJsonPath = join(workspaceRoot, appDir.name, "package.json");
      const packageJson = JSON.parse(
        await readFile(packageJsonPath, "utf-8"),
      ) as PackageJson;

      if (!renameWorkspaceDependencyKeys(packageJson, renameMap)) {
        continue;
      }

      await writeFile(
        packageJsonPath,
        `${JSON.stringify(packageJson, null, 2)}\n`,
      );
    }
  }
}

async function updatePackageImportsInSources(
  root: string,
  renameMap: Map<string, string>,
): Promise<void> {
  const sourceRoots = [join(root, "apps"), join(root, "packages")];

  for (const sourceRoot of sourceRoots) {
    const files = await listFilesRecursively(sourceRoot, SOURCE_EXTENSIONS);

    for (const filePath of files) {
      const content = await readFile(filePath, "utf-8");
      let next = content;

      for (const [oldName, newName] of renameMap) {
        next = replacePackageImports(next, oldName, newName);
      }

      if (next !== content) {
        await writeFile(filePath, next);
      }
    }
  }
}

async function main(): Promise<void> {
  const newSlug = process.argv[2];

  if (!newSlug) {
    console.error("Usage: bun run init:project <slug>");
    console.error("Example: bun run init:project my-cool-app");
    process.exit(1);
  }

  validateProjectSlug(newSlug);

  const root = join(import.meta.dir, "..");
  const packageJsonPath = join(root, "package.json");
  const packageJson = JSON.parse(
    await readFile(packageJsonPath, "utf-8"),
  ) as PackageJson;
  const oldSlug = packageJson.name;

  if (oldSlug === newSlug) {
    console.log(`Project slug is already "${newSlug}". No changes made.`);
    return;
  }

  packageJson.name = newSlug;
  packageJson.scripts ??= {};

  const renameMap = new Map<string, string>();
  const renamedApps: Array<{ app: AppName; from: string; to: string }> = [];

  for (const app of APPS) {
    const appPackageJsonPath = join(root, "apps", app, "package.json");
    const appPackageJson = JSON.parse(
      await readFile(appPackageJsonPath, "utf-8"),
    ) as PackageJson;
    const previousName = appPackageJson.name;

    if (
      !updateAppPackageJson(appPackageJson, app, oldSlug, newSlug) ||
      previousName === appPackageJson.name
    ) {
      continue;
    }

    renameMap.set(previousName, appPackageJson.name);
    renamedApps.push({ app, from: previousName, to: appPackageJson.name });
    ensureAppDevScriptUsesPathFilter(packageJson.scripts, app);

    await writeFile(
      appPackageJsonPath,
      `${JSON.stringify(appPackageJson, null, 2)}\n`,
    );
  }

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  if (renameMap.size > 0) {
    await updateWorkspacePackageDependencies(root, renameMap);
    await updatePackageImportsInSources(root, renameMap);
  }

  const appJsonPath = join(root, "apps", "sp", "app.json");
  const appJson = JSON.parse(
    await readFile(appJsonPath, "utf-8"),
  ) as ExpoAppJson;
  const appJsonChanged = updateExpoAppJson(appJson, oldSlug, newSlug);

  if (appJsonChanged) {
    await writeFile(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);
  }

  for (const app of WORKER_APPS) {
    const wranglerPath = join(root, "apps", app, "wrangler.jsonc");
    const content = await readFile(wranglerPath, "utf-8");
    await writeFile(
      wranglerPath,
      replaceWranglerName(content, oldSlug, newSlug, app),
    );
  }

  const readmePath = join(root, "README.md");
  const readme = await readFile(readmePath, "utf-8");
  await writeFile(readmePath, replaceReadmeTitle(readme, oldSlug, newSlug));

  console.log(`Renamed project slug: ${oldSlug} -> ${newSlug}`);
  console.log(
    `  Workers: ${workerName(newSlug, "api")}, ${workerName(newSlug, "web")}, ${workerName(newSlug, "lp")}`,
  );

  for (const { app, from, to } of renamedApps) {
    console.log(`  ${app} package: ${from} -> ${to}`);
  }

  if (appJsonChanged) {
    console.log(
      `  Expo app: slug=${appJson.expo.slug}, name=${appJson.expo.name}, scheme=${appJson.expo.scheme}`,
    );
  }

  console.log("Next: bun install");
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  });
}
