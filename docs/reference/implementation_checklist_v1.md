# Implementation Checklist v1

- Date: 2026-06-06
- Status: Implemented
- Implementation completed: 2026-06-07
- Verification: [2026-06-07_7_verification.md](../ticket_management/done/2026-06-07/2026-06-07_7_verification.md)
- Related spec: `monorepo_boilerplate_spec_v1.md`
- Related structure: `directory_structure_v1.md`
- Implementation directory: `DemoProject/four-app-monorepo-boilerplate/`

## Preconditions

- [x] Implement in `DemoProject/four-app-monorepo-boilerplate/`.
- [x] Use `four-app-monorepo-boilerplate` as the root package/repository name unless changed later.
- [x] Keep these intentionally deferred:
  - [ ] Whether `example.com` maps to LP or web app.
- [x] Document Workers deploy approach (decided during implementation):
  - [x] How Workers serves the `web` Vite build (`@cloudflare/vite-plugin` + SPA assets — see `docs/deployment.md`).
  - [x] How Workers serves the `lp` Astro build (`@astrojs/cloudflare` — see `docs/deployment.md`).
- [x] Document Bun first + Expo compatibility fallback for `apps/sp`.

## Phase 1: Root Workspace

tsconfig / Biome の方針と Biome スキル参照は `tooling_tsconfig_biome_v1.md` に従う。

- [x] Create root `package.json` with Bun workspaces.
- [x] Add workspace package names under `@repo/*`.
- [x] Create root `biome.json`.
- [x] Create root `tsconfig.base.json`.
- [x] Generate `bun.lock` after dependency install.
- [x] Add root scripts:
  - [x] `dev`: `mprocs`（本 checklist 原案は `bun run --filter '*' dev`。pane 分割 UI のため mprocs に変更）
  - [x] `dev:api`: `bun run --filter api dev`（原案 `bun --cwd` は Bun 1.3 で script 未実行のため filter 形式）
  - [x] `dev:web`: `bun run --filter web dev`
  - [x] `dev:sp`: `bun run --filter sp dev`
  - [x] `dev:lp`: `bun run --filter lp dev`
  - [x] `build`: `bun run --filter '*' build`
  - [x] `typecheck`: `bun run --filter '*' typecheck`
  - [x] `test`: `bun test`
  - [x] `test:watch`: `bun test --watch`
  - [x] `check`: `biome check .`
  - [x] `check:fix`: `biome check . --write`
  - [x] `lint`: `biome check .`
  - [x] `lint:fix`: `biome check . --write`
  - [x] `format`: `biome format .`
  - [x] `format:fix`: `biome format . --write`
- [x] Verify Bun workspace filter behavior during implementation.

## Phase 2: Shared Packages

### packages/config

- [x] Create `packages/config/package.json`.
- [x] Create `packages/config/tsconfig/base.json`.
- [x] Create `packages/config/tsconfig/react.json`.
- [x] Create `packages/config/tsconfig/worker.json`.
- [x] Create `packages/config/tsconfig/node.json`.
- [x] Create `packages/config/cloudflare/README.md`.

### packages/schema

- [x] Create `packages/schema/package.json`.
- [x] Create `packages/schema/tsconfig.json`.
- [x] Add `packages/schema/src/api/status.ts`.
- [x] Add `packages/schema/src/api/echo.ts`.
- [x] Add `packages/schema/src/common/app-env.ts`.
- [x] Add `packages/schema/src/index.ts`.
- [x] Add Bun tests for schema parsing.

### packages/env

- [x] Create `packages/env/package.json`.
- [x] Create `packages/env/tsconfig.json`.
- [x] Add common env schema in `packages/env/src/index.ts`.
- [x] Include common env candidates:
  - [x] `APP_ENV`
  - [x] `PUBLIC_SITE_URL`
  - [x] `PUBLIC_APP_URL`
  - [x] `PUBLIC_API_URL`
  - [x] `PUBLIC_APP_NAME`
  - [x] `PUBLIC_SUPPORT_EMAIL`
- [x] Add Bun tests for env parsing.

### packages/utils

- [x] Create `packages/utils/package.json`.
- [x] Create `packages/utils/tsconfig.json`.
- [x] Add `packages/utils/src/cn.ts`.
- [x] Add `packages/utils/src/index.ts`.
- [x] Add Bun tests for `cn()`.

### packages/ui

- [x] Create `packages/ui/package.json`.
- [x] Create `packages/ui/tsconfig.json`.
- [x] Add starter UI components:
  - [x] `button.tsx`
  - [x] `link-button.tsx`
  - [x] `card.tsx`
  - [x] `badge.tsx`
  - [x] `status-indicator.tsx`
  - [x] `index.ts`
- [x] Keep `Input`, `Dialog`, `Toast`, and `Tabs` out of initial core.

### packages/api-client

- [x] Create `packages/api-client/package.json`.
- [x] Create `packages/api-client/tsconfig.json`.
- [x] Add Hono RPC client wrapper.
- [x] Add `packages/api-client/src/helpers/status.ts`.
- [x] Add `packages/api-client/src/helpers/echo.ts`.
- [x] Add `packages/api-client/src/index.ts`.
- [x] Do not include React hooks.

## Phase 3: Apps

App の土台作成は `app_scaffolding_v1.md` に従う（create コマンド・C3 選択・作成後調整）。

### apps/api

- [x] Create `apps/api/package.json`.
- [x] Create `apps/api/tsconfig.json`.
- [x] Create `apps/api/wrangler.jsonc`.
- [x] Add Hono.
- [x] Add `apps/api/src/app.ts`.
- [x] Add `apps/api/src/index.ts`.
- [x] Implement `GET /health`.
- [x] Implement `GET /status`.
- [x] Implement `POST /echo`.
- [x] Export `AppType`.
- [x] Add Bun tests for `/health`, `/status`, and `/echo`.

### apps/web

- [x] Create `apps/web/package.json`.
- [x] Create `apps/web/tsconfig.json`.
- [x] Create `apps/web/vite.config.ts`.
- [x] Create `apps/web/wrangler.jsonc`.
- [x] Add Vite + React.
- [x] Add TanStack Router.
- [x] Add Tailwind CSS.
- [x] Add `@/` app alias.
- [x] Add `apps/web/src/main.tsx`.
- [x] Add `apps/web/src/router.tsx`.
- [x] Add `apps/web/src/routes/__root.tsx`.
- [x] Add `apps/web/src/routes/index.tsx`.
- [x] Display API status.
- [x] Link to LP/API where useful.

### apps/sp

- [x] Create `apps/sp/package.json`.
- [x] Create `apps/sp/tsconfig.json`.
- [x] Create `apps/sp/app.json`.
- [x] Add Expo + Expo Router.
- [x] Use `apps/sp/src/app/` for Expo Router files.
- [x] Add `apps/sp/src/app/_layout.tsx`.
- [x] Add `apps/sp/src/app/index.tsx`.
- [x] Add `apps/sp/src/components/status-card.tsx`.
- [x] Add `apps/sp/src/lib/api.ts`.
- [x] Display API status.
- [x] Add `@/` app alias if compatible.
- [x] Document Expo compatibility fallback.

### apps/lp

- [x] Create `apps/lp/package.json`.
- [x] Create `apps/lp/tsconfig.json`.
- [x] Create `apps/lp/astro.config.mjs`.
- [x] Create `apps/lp/wrangler.jsonc`.
- [x] Add Astro.
- [x] Add Tailwind CSS.
- [x] Add `apps/lp/src/pages/index.astro`.
- [x] Add `apps/lp/src/layouts/base-layout.astro`.
- [x] Add `apps/lp/src/components/hero.astro`.
- [x] Add `apps/lp/src/components/cta.astro`.
- [x] Add `apps/lp/src/styles/global.css`.
- [x] Add CTA to web app.

## Phase 4: Docs

- [x] Create standard `README.md`.
- [x] Add README sections:
  - [x] overview
  - [x] apps
  - [x] packages
  - [x] setup
  - [x] scripts
  - [x] env
  - [x] docs links
- [x] Create `docs/architecture.md`.
- [x] Create `docs/env.md`.
- [x] Create `docs/development.md`.
- [x] Create `docs/deployment.md`.
- [x] Create recipes with procedure + code examples:
  - [x] `docs/recipes/database.md`
  - [x] `docs/recipes/auth.md`
  - [x] `docs/recipes/cloudflare-access.md`
  - [x] `docs/recipes/openapi.md`
- [x] Mention recipe backlog:
  - [x] `storage-r2.md`
  - [x] `email.md`
  - [x] `database-d1.md`
  - [x] `kv.md`
  - [x] `queues.md`

## Phase 5: Verification

- [x] `bun install`
- [x] `bun run check`
- [x] `bun run typecheck`
- [x] `bun run test`
- [x] `bun run dev:api`
- [x] `bun run dev:web`
- [x] `bun run dev:sp`
- [x] `bun run dev:lp`
- [x] Confirm `web` can call API.
- [x] Confirm `sp` can call API.
- [x] Confirm `lp` CTA points to web app.

## Not In Initial Core

初期 core には含めない（意図的に未導入）。

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
