# Implementation Checklist v1

- Date: 2026-06-06
- Status: Final
- Related spec: `monorepo_boilerplate_spec_v1.md`
- Related structure: `directory_structure_v1.md`
- Implementation directory: `DemoProject/four-app-monorepo-boilerplate/`

## Preconditions

- [ ] Implement in `DemoProject/four-app-monorepo-boilerplate/`.
- [ ] Use `four-app-monorepo-boilerplate` as the root package/repository name unless changed later.
- [ ] Keep these intentionally deferred:
  - [ ] Whether `example.com` maps to LP or web app.
  - [ ] How Workers serves the `web` Vite build.
  - [ ] How Workers serves the `lp` Astro build.
- [ ] Document Bun first + Expo compatibility fallback for `apps/sp`.

## Phase 1: Root Workspace

tsconfig / Biome の方針と Biome スキル参照は `tooling_tsconfig_biome_v1.md` に従う。

- [ ] Create root `package.json` with Bun workspaces.
- [ ] Add workspace package names under `@repo/*`.
- [ ] Create root `biome.json`.
- [ ] Create root `tsconfig.base.json`.
- [ ] Generate `bun.lock` after dependency install.
- [ ] Add root scripts:
  - [ ] `dev`: `bun run --filter '*' dev`
  - [ ] `dev:api`: `bun --cwd apps/api run dev`
  - [ ] `dev:web`: `bun --cwd apps/web run dev`
  - [ ] `dev:sp`: `bun --cwd apps/sp run dev`
  - [ ] `dev:lp`: `bun --cwd apps/lp run dev`
  - [ ] `build`: `bun run --filter '*' build`
  - [ ] `typecheck`: `bun run --filter '*' typecheck`
  - [ ] `test`: `bun test`
  - [ ] `test:watch`: `bun test --watch`
  - [ ] `check`: `biome check .`
  - [ ] `check:fix`: `biome check . --write`
  - [ ] `lint`: `biome check .`
  - [ ] `lint:fix`: `biome check . --write`
  - [ ] `format`: `biome format .`
  - [ ] `format:fix`: `biome format . --write`
- [ ] Verify Bun workspace filter behavior during implementation.

## Phase 2: Shared Packages

### packages/config

- [ ] Create `packages/config/package.json`.
- [ ] Create `packages/config/tsconfig/base.json`.
- [ ] Create `packages/config/tsconfig/react.json`.
- [ ] Create `packages/config/tsconfig/worker.json`.
- [ ] Create `packages/config/tsconfig/node.json`.
- [ ] Create `packages/config/cloudflare/README.md`.

### packages/schema

- [ ] Create `packages/schema/package.json`.
- [ ] Create `packages/schema/tsconfig.json`.
- [ ] Add `packages/schema/src/api/status.ts`.
- [ ] Add `packages/schema/src/api/echo.ts`.
- [ ] Add `packages/schema/src/common/app-env.ts`.
- [ ] Add `packages/schema/src/index.ts`.
- [ ] Add Bun tests for schema parsing.

### packages/env

- [ ] Create `packages/env/package.json`.
- [ ] Create `packages/env/tsconfig.json`.
- [ ] Add common env schema in `packages/env/src/index.ts`.
- [ ] Include common env candidates:
  - [ ] `APP_ENV`
  - [ ] `PUBLIC_SITE_URL`
  - [ ] `PUBLIC_APP_URL`
  - [ ] `PUBLIC_API_URL`
  - [ ] `PUBLIC_APP_NAME`
  - [ ] `PUBLIC_SUPPORT_EMAIL`
- [ ] Add Bun tests for env parsing.

### packages/utils

- [ ] Create `packages/utils/package.json`.
- [ ] Create `packages/utils/tsconfig.json`.
- [ ] Add `packages/utils/src/cn.ts`.
- [ ] Add `packages/utils/src/index.ts`.
- [ ] Add Bun tests for `cn()`.

### packages/ui

- [ ] Create `packages/ui/package.json`.
- [ ] Create `packages/ui/tsconfig.json`.
- [ ] Add starter UI components:
  - [ ] `button.tsx`
  - [ ] `link-button.tsx`
  - [ ] `card.tsx`
  - [ ] `badge.tsx`
  - [ ] `status-indicator.tsx`
  - [ ] `index.ts`
- [ ] Keep `Input`, `Dialog`, `Toast`, and `Tabs` out of initial core.

### packages/api-client

- [ ] Create `packages/api-client/package.json`.
- [ ] Create `packages/api-client/tsconfig.json`.
- [ ] Add Hono RPC client wrapper.
- [ ] Add `packages/api-client/src/helpers/status.ts`.
- [ ] Add `packages/api-client/src/helpers/echo.ts`.
- [ ] Add `packages/api-client/src/index.ts`.
- [ ] Do not include React hooks.

## Phase 3: Apps

App の土台作成は `app_scaffolding_v1.md` に従う（create コマンド・C3 選択・作成後調整）。

### apps/api

- [ ] Create `apps/api/package.json`.
- [ ] Create `apps/api/tsconfig.json`.
- [ ] Create `apps/api/wrangler.jsonc`.
- [ ] Add Hono.
- [ ] Add `apps/api/src/app.ts`.
- [ ] Add `apps/api/src/index.ts`.
- [ ] Implement `GET /health`.
- [ ] Implement `GET /status`.
- [ ] Implement `POST /echo`.
- [ ] Export `AppType`.
- [ ] Add Bun tests for `/health`, `/status`, and `/echo`.

### apps/web

- [ ] Create `apps/web/package.json`.
- [ ] Create `apps/web/tsconfig.json`.
- [ ] Create `apps/web/vite.config.ts`.
- [ ] Create `apps/web/wrangler.jsonc`.
- [ ] Add Vite + React.
- [ ] Add TanStack Router.
- [ ] Add Tailwind CSS.
- [ ] Add `@/` app alias.
- [ ] Add `apps/web/src/main.tsx`.
- [ ] Add `apps/web/src/router.tsx`.
- [ ] Add `apps/web/src/routes/__root.tsx`.
- [ ] Add `apps/web/src/routes/index.tsx`.
- [ ] Display API status.
- [ ] Link to LP/API where useful.

### apps/sp

- [ ] Create `apps/sp/package.json`.
- [ ] Create `apps/sp/tsconfig.json`.
- [ ] Create `apps/sp/app.json`.
- [ ] Add Expo + Expo Router.
- [ ] Use `apps/sp/src/app/` for Expo Router files.
- [ ] Add `apps/sp/src/app/_layout.tsx`.
- [ ] Add `apps/sp/src/app/index.tsx`.
- [ ] Add `apps/sp/src/components/status-card.tsx`.
- [ ] Add `apps/sp/src/lib/api.ts`.
- [ ] Display API status.
- [ ] Add `@/` app alias if compatible.
- [ ] Document Expo compatibility fallback.

### apps/lp

- [ ] Create `apps/lp/package.json`.
- [ ] Create `apps/lp/tsconfig.json`.
- [ ] Create `apps/lp/astro.config.mjs`.
- [ ] Create `apps/lp/wrangler.jsonc`.
- [ ] Add Astro.
- [ ] Add Tailwind CSS.
- [ ] Add `apps/lp/src/pages/index.astro`.
- [ ] Add `apps/lp/src/layouts/base-layout.astro`.
- [ ] Add `apps/lp/src/components/hero.astro`.
- [ ] Add `apps/lp/src/components/cta.astro`.
- [ ] Add `apps/lp/src/styles/global.css`.
- [ ] Add CTA to web app.

## Phase 4: Docs

- [ ] Create standard `README.md`.
- [ ] Add README sections:
  - [ ] overview
  - [ ] apps
  - [ ] packages
  - [ ] setup
  - [ ] scripts
  - [ ] env
  - [ ] docs links
- [ ] Create `docs/architecture.md`.
- [ ] Create `docs/env.md`.
- [ ] Create `docs/development.md`.
- [ ] Create `docs/deployment.md`.
- [ ] Create recipes with procedure + code examples:
  - [ ] `docs/recipes/database.md`
  - [ ] `docs/recipes/auth.md`
  - [ ] `docs/recipes/cloudflare-access.md`
  - [ ] `docs/recipes/openapi.md`
- [ ] Mention recipe backlog:
  - [ ] `storage-r2.md`
  - [ ] `email.md`
  - [ ] `database-d1.md`
  - [ ] `kv.md`
  - [ ] `queues.md`

## Phase 5: Verification

- [ ] `bun install`
- [ ] `bun run check`
- [ ] `bun run typecheck`
- [ ] `bun run test`
- [ ] `bun run dev:api`
- [ ] `bun run dev:web`
- [ ] `bun run dev:sp`
- [ ] `bun run dev:lp`
- [ ] Confirm `web` can call API.
- [ ] Confirm `sp` can call API.
- [ ] Confirm `lp` CTA points to web app.

## Not In Initial Core

- [ ] CI
- [ ] DB / ORM
- [ ] Auth
- [ ] Cloudflare Access
- [ ] OpenAPI
- [ ] Stripe / payment
- [ ] R2 / storage
- [ ] KV / queues
- [ ] analytics
- [ ] email
- [ ] Vitest
- [ ] Jest
- [ ] Playwright
- [ ] React Testing Library
- [ ] Expo/Jest
