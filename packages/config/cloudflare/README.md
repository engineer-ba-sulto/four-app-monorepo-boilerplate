# Cloudflare Workers — shared notes

`api`, `web`, and `lp` each deploy as a separate Cloudflare Worker. Worker-specific config lives in each app’s `wrangler.jsonc`; this folder only documents shared conventions.

## Worker naming

Use placeholders until you rename the project:

```txt
<project-name>-api
<project-name>-web
<project-name>-lp
```

## Layout

| App   | Role             | Config                    |
| ----- | ---------------- | ------------------------- |
| `api` | Hono API         | `apps/api/wrangler.jsonc` |
| `web` | Vite + React SPA | `apps/web/wrangler.jsonc` |
| `lp`  | Astro marketing  | `apps/lp/wrangler.jsonc`  |

`apps/sp` is not deployed to Workers (Expo / EAS).

## Env and secrets

- Non-secret defaults: `.env` / `.dev.vars` per app (see `docs/env.md` when added).
- Production secrets: `wrangler secret put` or the Cloudflare dashboard.
- Shared public URLs: `PUBLIC_SITE_URL`, `PUBLIC_APP_URL`, `PUBLIC_API_URL` via `@repo/env`.

## Further reading

Deployment steps: [docs/deployment.md](../../../docs/deployment.md). Recipes: [docs/recipes/](../../../docs/recipes/).
