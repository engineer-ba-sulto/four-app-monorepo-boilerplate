import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SLUG_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const WORKER_APPS = ["api", "web", "lp"] as const;

export type WorkerApp = (typeof WORKER_APPS)[number];

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
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8")) as {
    name: string;
  };
  const oldSlug = packageJson.name;

  if (oldSlug === newSlug) {
    console.log(`Project slug is already "${newSlug}". No changes made.`);
    return;
  }

  packageJson.name = newSlug;
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

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
  console.log("Next: bun install");
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  });
}
