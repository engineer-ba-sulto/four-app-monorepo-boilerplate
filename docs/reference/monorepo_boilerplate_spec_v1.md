# Four App Monorepo Boilerplate Spec v1

- Date: 2026-06-06
- Status: Final
- Boilerplate name: `four-app-monorepo-boilerplate`
- Intended implementation directory: `DemoProject/four-app-monorepo-boilerplate/`
- Related:
  - `directory_structure_v1.md`
  - `implementation_checklist_v1.md`
  - `app_scaffolding_v1.md`
  - `../four_app_monorepo_boilerplate_cursor_implementation_instruction_v1.md`

## Summary

`api / web / sp / lp` の 4 app を持つ、コピーして使える monorepo boilerplate。

```txt
api = Hono on Cloudflare Workers
web = Vite + React + TanStack Router on Cloudflare Workers
sp  = Expo + Expo Router
lp  = Astro on Cloudflare Workers
```

設計思想:

- 薄い core + recipes。
- core はコピー直後に動く。
- DB / Auth / Cloudflare Access / OpenAPI は core に密結合せず recipes に置く。
- Cloudflare first。
- JS runtime / package manager / workspace は Bun。
- `apps/sp` は Bun first + Expo 互換逃げ道。

## Core Decisions

### Runtime / Workspace

```txt
runtime: Bun
package manager: Bun
workspace: Bun workspaces
formatter/linter: Biome
test runner: Bun test
```

### Deployment Direction

```txt
apps/api -> Cloudflare Workers
apps/web -> Cloudflare Workers
apps/lp  -> Cloudflare Workers
apps/sp  -> not deployed to Workers
```

`api / web / lp` はそれぞれ別 Worker。

Worker names are placeholders:

```txt
<project-name>-api
<project-name>-web
<project-name>-lp
```

### Domain Defaults

Default:

```env
PUBLIC_SITE_URL=https://example.com
PUBLIC_APP_URL=https://app.example.com
PUBLIC_API_URL=https://api.example.com
```

Alternative if root is the web app:

```env
PUBLIC_SITE_URL=https://lp.example.com
PUBLIC_APP_URL=https://example.com
PUBLIC_API_URL=https://api.example.com
```

`example.com` を LP に使うか Web アプリに使うかは未決。

## Apps

### apps/api

```txt
apps/api/
└── src/
    ├── app.ts
    └── index.ts
```

- Hono app は `src/app.ts` に置く。
- Cloudflare Workers entry は `src/index.ts`。
- `AppType` を export する。
- routes 分離は API が増えてから検討する。

Initial endpoints:

```txt
GET  /health
GET  /status
POST /echo
```

### apps/web

```txt
apps/web/
└── src/
    ├── main.tsx
    ├── router.tsx
    └── routes/
        ├── __root.tsx
        └── index.tsx
```

- Vite + React + TanStack Router。
- ログイン後アプリ型。
- Auth は core に入れない。
- 初期画面では API status を表示する。
- Tailwind CSS + `@repo/ui` を使う。

### apps/sp

```txt
apps/sp/
└── src/
    ├── app/
    │   ├── _layout.tsx
    │   └── index.tsx
    ├── components/
    │   └── status-card.tsx
    └── lib/
        └── api.ts
```

- Expo + Expo Router。
- Expo Router files は `src/app/` に置く。
- 初期 core では tabs 構成にしない。
- API status を表示する。
- React Native 専用 UI を使う。
- Bun first だが、Expo / EAS / React Native 側で Bun 由来の問題が出た場合は Expo 公式 CLI の要求に従う。

### apps/lp

```txt
apps/lp/
└── src/
    ├── pages/
    │   └── index.astro
    ├── layouts/
    │   └── base-layout.astro
    ├── components/
    │   ├── hero.astro
    │   └── cta.astro
    └── styles/
        └── global.css
```

- Astro。
- LP / marketing starter。
- CTA から Web app へ遷移する。
- Tailwind CSS + `@repo/ui` を使う。
- 初期 core では `features / pricing / faq` などを増やしすぎない。

## Packages

```txt
packages/
├── schema/
├── api-client/
├── env/
├── config/
├── utils/
└── ui/
```

Package names:

```txt
@repo/schema
@repo/api-client
@repo/env
@repo/config
@repo/utils
@repo/ui
```

### packages/schema

```txt
packages/schema/
└── src/
    ├── api/
    │   ├── echo.ts
    │   └── status.ts
    ├── common/
    │   └── app-env.ts
    └── index.ts
```

- Zod schema と shared types。
- API schema + common primitives 型。
- 初期段階では domain 別構成にしない。

### packages/api-client

```txt
packages/api-client/
└── src/
    ├── helpers/
    │   ├── echo.ts
    │   └── status.ts
    └── index.ts
```

- Hono RPC wrapper + helper functions。
- React hooks は入れない。
- hooks が必要な場合は各 app 側で作る。

### packages/env

- 共通 env だけを置く。
- app 固有 env は各 app に置く。

Common env candidates:

```env
APP_ENV=development
PUBLIC_SITE_URL=https://example.com
PUBLIC_APP_URL=https://app.example.com
PUBLIC_API_URL=https://api.example.com
PUBLIC_APP_NAME=My App
PUBLIC_SUPPORT_EMAIL=support@example.com
```

### packages/config

```txt
packages/config/
├── tsconfig/
│   ├── base.json
│   ├── react.json
│   ├── worker.json
│   └── node.json
└── cloudflare/
    └── README.md
```

- Biome は root `biome.json`。
- Tailwind は `apps/web`, `apps/lp`, `packages/ui` 側。
- `wrangler.jsonc` は各 app に置き、共通方針を `packages/config/cloudflare/README.md` または `docs/deployment.md` にまとめる。
- wrangler config 生成方式は採用しない。

### packages/utils

```txt
packages/utils/
└── src/
    ├── cn.ts
    └── index.ts
```

- 初期は `cn()` 程度。
- 汎用便利関数集にしない。

### packages/ui

```txt
packages/ui/
└── src/
    ├── button.tsx
    ├── link-button.tsx
    ├── card.tsx
    ├── badge.tsx
    ├── status-indicator.tsx
    └── index.ts
```

- `web / lp` 用。
- Tailwind CSS 前提。
- `sp` では使わない。
- `Input`, `Dialog`, `Toast`, `Tabs` などは初期 core に入れない。

## Import / Naming

### File Naming

ファイル名はフレームワークの慣習を優先する。

```txt
Astro:
  framework/project convention first

React / web:
  framework/project convention first

Expo Router:
  _layout.tsx
  index.tsx
  route conventions first

shared packages:
  kebab-case by default
```

### Path Aliases

workspace package は package import。

```ts
import { x } from "@repo/schema";
```

app 内 import は `@/` alias を許可。

```ts
import { StatusCard } from "@/components/status-card";
```

`@api/*`, `@web/*`, `@shared/*` のような全体 alias は作らない。

## Root Scripts

```json
{
  "scripts": {
    "dev": "bun run --filter '*' dev",
    "dev:api": "bun --cwd apps/api run dev",
    "dev:web": "bun --cwd apps/web run dev",
    "dev:sp": "bun --cwd apps/sp run dev",
    "dev:lp": "bun --cwd apps/lp run dev",
    "build": "bun run --filter '*' build",
    "typecheck": "bun run --filter '*' typecheck",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "check": "biome check .",
    "check:fix": "biome check . --write",
    "lint": "biome check .",
    "lint:fix": "biome check . --write",
    "format": "biome format .",
    "format:fix": "biome format . --write"
  }
}
```

実装時に Bun workspace filter 挙動は検証する。

## Testing

core は Bun test で最小テスト。

```txt
apps/api:
  /health
  /status
  /echo

packages/schema:
  Zod schema parse

packages/env:
  env schema parse

packages/utils:
  cn()
```

初期 core に入れない:

```txt
Vitest
Jest
Playwright
React Testing Library
Expo/Jest
```

## Docs

README は標準 README。

```txt
README.md:
  overview
  apps
  packages
  setup
  scripts
  env
  docs links
```

docs:

```txt
docs/
├── architecture.md
├── env.md
├── development.md
├── deployment.md
└── recipes/
    ├── database.md
    ├── auth.md
    ├── cloudflare-access.md
    └── openapi.md
```

recipes は手順 + コード例。

recipe backlog:

```txt
storage-r2.md
email.md
database-d1.md
kv.md
queues.md
```

## CI

初期 core には CI を入れない。

README で手元実行を案内する。

```txt
bun run check
bun run typecheck
bun run test
```

## Deferred

意図的に保留:

- `example.com` を LP に使うか Web アプリに使うか。
- Workers で `web` の Vite build をどう配信するか。
- Workers で `lp` の Astro build をどう配信するか。

core に入れない:

- DB / ORM
- Auth
- Cloudflare Access
- OpenAPI
- Stripe / payment
- R2 / storage
- KV / queues
- analytics
- email
