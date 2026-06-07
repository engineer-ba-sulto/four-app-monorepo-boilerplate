# apps/api

Hono API on Cloudflare Workers.

## Scripts

```bash
bun run dev
bun run typecheck
bun test
bun run deploy
```

From the monorepo root:

```bash
bun run dev:api
```

## Types

Regenerate Worker bindings after changing `wrangler.jsonc`:

```bash
bun run cf-typegen
```
