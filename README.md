# four-app-monorepo-boilerplate

4 app（API / Web / SP / LP）構成の Bun monorepo boilerplate。Cloudflare Workers 上の Hono API、Vite + React Web、Expo SP、Astro LP をひとつの workspace で管理する。

## Overview

| App        | Stack                          | Deploy target      |
| ---------- | ------------------------------ | ------------------ |
| `apps/api` | Hono                           | Cloudflare Workers |
| `apps/web` | Vite + React + TanStack Router | Cloudflare Workers |
| `apps/sp`  | Expo + Expo Router             | EAS / app stores   |
| `apps/lp`  | Astro                          | Cloudflare Workers |

共有パッケージ（`@repo/*`）で Zod schema、env、API client、UI を横断利用する。formatter / linter は Biome、テストは Bun test。

## Apps

| Path                   | Package name | Description                               |
| ---------------------- | ------------ | ----------------------------------------- |
| [apps/api](./apps/api) | `api`        | Hono API（`/health`, `/status`, `/echo`） |
| [apps/web](./apps/web) | `web`        | メイン Web アプリ。API status を表示      |
| [apps/sp](./apps/sp)   | `sp`         | モバイルアプリ（Expo Router）             |
| [apps/lp](./apps/lp)   | `lp`         | ランディングページ。Web app への CTA      |

各 app は独立して削除・差し替えできるよう、密結合を避けている（例: `lp` 不要なら `apps/lp` と関連 script を外す）。

## Packages

| Path                                         | Package name       | Description                         |
| -------------------------------------------- | ------------------ | ----------------------------------- |
| [packages/schema](./packages/schema)         | `@repo/schema`     | Zod schema と shared types          |
| [packages/api-client](./packages/api-client) | `@repo/api-client` | Hono RPC client + helpers           |
| [packages/env](./packages/env)               | `@repo/env`        | 共通 env schema（`parseCommonEnv`） |
| [packages/config](./packages/config)         | `@repo/config`     | 共有 tsconfig / Cloudflare notes    |
| [packages/utils](./packages/utils)           | `@repo/utils`      | 汎用ユーティリティ（`cn()` など）   |
| [packages/ui](./packages/ui)                 | `@repo/ui`         | Tailwind 前提 UI（web / lp 向け）   |

`@repo/ui` は web 向けのため、`apps/sp` では React Native 専用 UI を使う。

## Setup

**前提:** [Bun](https://bun.com) 1.3+

```bash
# 依存関係インストール
bun install

# 型チェック・lint・テスト
bun run typecheck
bun run check
bun run test
```

### ローカル開発

API を先に起動し、web / sp から status を確認する。

```bash
# ターミナル 1: API（Wrangler dev、デフォルト http://localhost:8787）
bun run dev:api

# ターミナル 2: Web（Vite、デフォルト http://localhost:5173）
bun run dev:web

# ターミナル 3: SP（Expo / Metro）
bun run dev:sp

# ターミナル 4: LP（Astro dev）
bun run dev:lp
```

全 app を並列起動する場合:

```bash
bun run dev
```

### apps/sp — Bun first + Expo 互換の逃げ道

- **パッケージ管理は Bun を正とする**（`bun install`、ルート script 実行）。
- EAS Build、`expo prebuild`、ネイティブ toolchain など Expo 公式 CLI 側で Bun 起因の不具合が出た場合は、[Expo 公式ドキュメント](https://docs.expo.dev/) に従い、**該当コマンドのみ** npm / yarn / npx で実行する逃げ道を取る。
- クライアント env は `EXPO_PUBLIC_*` プレフィックス（例: `EXPO_PUBLIC_API_URL`）。詳細は [docs/env.md](./docs/env.md)。

## Scripts

| Script               | Description                      |
| -------------------- | -------------------------------- |
| `bun run dev`        | 全 workspace の `dev` を並列実行 |
| `bun run dev:api`    | API（Wrangler dev）              |
| `bun run dev:web`    | Web（Vite）                      |
| `bun run dev:sp`     | SP（Expo）                       |
| `bun run dev:lp`     | LP（Astro dev）                  |
| `bun run build`      | 全 workspace の `build`          |
| `bun run typecheck`  | 全 workspace の型チェック        |
| `bun run test`       | Bun test（ルート）               |
| `bun run check`      | Biome check                      |
| `bun run check:fix`  | Biome check + auto-fix           |
| `bun run format`     | Biome format（dry-run）          |
| `bun run format:fix` | Biome format + write             |

`dev:*` は `bun run --filter <app> dev` 形式。Bun 1.3 では `bun --cwd apps/<app> run dev` だと script が実行されないため、この形式に統一している。

## Env

共通 env は `@repo/env` の `parseCommonEnv` で検証する。app ごとに読み取り方法が異なる。

| Variable               | Description                              |
| ---------------------- | ---------------------------------------- |
| `APP_ENV`              | `development` / `staging` / `production` |
| `PUBLIC_SITE_URL`      | サイト（LP または web）の URL            |
| `PUBLIC_APP_URL`       | Web app の URL                           |
| `PUBLIC_API_URL`       | API の URL                               |
| `PUBLIC_APP_NAME`      | アプリ名                                 |
| `PUBLIC_SUPPORT_EMAIL` | サポートメール                           |

- **api / web / lp（Workers）:** `wrangler.jsonc` の `vars`、`.dev.vars`
- **web / lp（Vite / Astro dev）:** `.env` の `PUBLIC_*`
- **sp（Expo）:** `EXPO_PUBLIC_*`（例: `EXPO_PUBLIC_API_URL`）

`.env` や secrets はコミットしない。詳細は [docs/env.md](./docs/env.md)。

## Docs

| Document                                       | Description                     |
| ---------------------------------------------- | ------------------------------- |
| [docs/architecture.md](./docs/architecture.md) | 構成・データフロー              |
| [docs/env.md](./docs/env.md)                   | 環境変数の詳細                  |
| [docs/development.md](./docs/development.md)   | 開発ワークフロー                |
| [docs/deployment.md](./docs/deployment.md)     | Cloudflare / EAS デプロイ       |
| [docs/recipes/](./docs/recipes/)               | 追加機能の手順（DB、Auth など） |

### Recipes（実装済み）

| Recipe                                                      | Description       |
| ----------------------------------------------------------- | ----------------- |
| [database.md](./docs/recipes/database.md)                   | DB / ORM 追加     |
| [auth.md](./docs/recipes/auth.md)                           | 認証              |
| [cloudflare-access.md](./docs/recipes/cloudflare-access.md) | Cloudflare Access |
| [openapi.md](./docs/recipes/openapi.md)                     | OpenAPI 生成      |

### Recipe backlog（未作成）

初期 core には含めない。必要になったら `docs/recipes/` に追加する。

| Backlog          | Description               |
| ---------------- | ------------------------- |
| `storage-r2.md`  | R2 オブジェクトストレージ |
| `email.md`       | メール送信                |
| `database-d1.md` | Cloudflare D1             |
| `kv.md`          | Workers KV                |
| `queues.md`      | Cloudflare Queues         |

### Reference（設計正本）

| Document                                                                                           | Description        |
| -------------------------------------------------------------------------------------------------- | ------------------ |
| [docs/reference/monorepo_boilerplate_spec_v1.md](./docs/reference/monorepo_boilerplate_spec_v1.md) | 仕様               |
| [docs/reference/directory_structure_v1.md](./docs/reference/directory_structure_v1.md)             | ディレクトリ構成   |
| [docs/reference/implementation_checklist_v1.md](./docs/reference/implementation_checklist_v1.md)   | 実装チェックリスト |
