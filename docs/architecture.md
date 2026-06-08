# Architecture

four-app-monorepo-boilerplate の構成とデータフロー。

## High-level layout

```txt
DemoProject/four-app-monorepo-boilerplate/
├── apps/
│   ├── api/     # Hono on Cloudflare Workers
│   ├── web/     # Vite + React + TanStack Router on Workers
│   ├── sp/      # Expo + Expo Router (mobile)
│   └── lp/      # Astro on Cloudflare Workers
├── packages/
│   ├── schema/       # Zod schemas (@repo/schema)
│   ├── api-client/   # Hono RPC client (@repo/api-client)
│   ├── env/          # Common env parsing (@repo/env)
│   ├── config/       # Shared tsconfig
│   ├── utils/        # cn() etc.
│   └── ui/           # Tailwind UI (web / lp)
└── docs/
```

## App roles

| App     | Role                                        | Deploy                                       |
| ------- | ------------------------------------------- | -------------------------------------------- |
| **api** | REST/RPC API。`/health`, `/status`, `/echo` | Cloudflare Worker                            |
| **web** | ログイン後のメイン Web アプリ               | Cloudflare Worker（Vite build + SPA assets） |
| **sp**  | iOS / Android ネイティブアプリ              | EAS Build → app stores                       |
| **lp**  | マーケティング LP。Web app へ CTA           | Cloudflare Worker（Astro SSR/static）        |

`example.com` を LP にするか Web にするかは未決。`PUBLIC_SITE_URL` / `PUBLIC_APP_URL` で差し替える。

## Request flow

```txt
┌─────────┐     GET /status      ┌─────────┐
│  web    │ ───────────────────► │         │
│  sp     │ ───────────────────► │   api   │
│  lp     │  (CTA link only)     │  (Hono) │
└─────────┘                      └─────────┘
```

1. **web / sp** は `@repo/api-client` 経由で `PUBLIC_API_URL` に接続し `/status` を表示する。
2. **api** は `@repo/schema` で request/response を検証し、`AppType` を export して Hono RPC の型を共有する。
3. **lp** は `@repo/env` の `PUBLIC_APP_URL` で Web app へのリンクを生成する（API 直呼びは必須ではない）。

## Shared packages

### @repo/schema

Zod schema と TypeScript types。API の入出力と env の `APP_ENV` などを定義する。domain 別の深いフォルダ構成は初期段階では避ける。

### @repo/api-client

```typescript
import { createApiClient } from "@repo/api-client";
import type { AppType } from "api/app";

const client = createApiClient<AppType>(baseUrl);
```

React hooks は含めない。必要なら各 app 側で TanStack Query 等を使う。

### @repo/env

共通 env の Zod schema と `parseCommonEnv()`。app 固有の読み取り（`import.meta.env`, `c.env`, `EXPO_PUBLIC_*`）は各 app の `src/lib/env.ts` に置く。

### @repo/ui

Tailwind 前提の React コンポーネント（web / lp）。`apps/sp` は React Native 専用 UI を使うため `@repo/ui` には依存しない。

## Cloudflare Workers

`api`, `web`, `lp` はそれぞれ独立した Worker としてデプロイする。

| Worker | wrangler name placeholder | Entry                         |
| ------ | ------------------------- | ----------------------------- |
| api    | `<project-name>-api`      | `apps/api/src/index.ts`       |
| web    | `<project-name>-web`      | Vite build + SPA routing      |
| lp     | `<project-name>-lp`       | Astro + `@astrojs/cloudflare` |

Worker 間の service binding や D1/R2 などは初期 core には含めない。追加手順は [recipes/](./recipes/) を参照。

## Type sharing (Hono RPC)

```txt
apps/api/src/app.ts  ──export AppType──►  packages/api-client
                                      └──►  apps/web, apps/sp
```

`apps/web` と `apps/sp` は workspace 依存 `api` から `AppType` を import し、型安全な RPC client を構築する。

## Intentionally deferred

初期 core に含めないもの（recipes / backlog で対応）:

- CI
- Database / ORM
- Auth
- Cloudflare Access
- OpenAPI
- R2, KV, Queues, email
- Vitest / Jest / Playwright

## Further reading

- [env.md](./env.md) — 環境変数
- [development.md](./development.md) — ローカル開発
- [deployment.md](./deployment.md) — デプロイ
- [reference/directory_structure_v1.md](./reference/directory_structure_v1.md) — ファイル構成の正本
