// @ts-check
import path from "node:path";
import { fileURLToPath } from "node:url";

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  adapter: cloudflare(),
  integrations: [react()],
  vite: {
    envPrefix: ["PUBLIC_", "VITE_"],
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "./src"),
      },
    },
  },
});
