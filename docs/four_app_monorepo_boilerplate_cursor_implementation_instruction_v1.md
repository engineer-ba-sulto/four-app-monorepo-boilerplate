# Four App Monorepo Boilerplate Cursor実装指示書 v1

## 実装先

`DemoProject/four-app-monorepo-boilerplate/`

このプロジェクトは、`DemoProject/four-app-monorepo-boilerplate/` を単独ワークスペースとして開いて実装する。  
親ワークスペース `Engineer-BA-Sulto-Cursor` から `DemoProject/` 配下の作成・変更・削除・ビルド・依存インストール・Git操作は行わない。

## 正本ドキュメント

実装時は、次の4ファイルを正本として参照する（プロジェクト内 `docs/reference/` に配置）。

- `docs/reference/monorepo_boilerplate_spec_v1.md`
- `docs/reference/directory_structure_v1.md`
- `docs/reference/implementation_checklist_v1.md`
- `docs/reference/app_scaffolding_v1.md`

本指示書は、上記3ファイルをCursor実装用にまとめたもの。詳細判断で迷った場合は、正本ドキュメントを優先する。

## 実装ゴール

`api / web / sp / lp` の4 appを持つ、コピーして使える monorepo boilerplate を実装する。

```txt
api = Hono on Cloudflare Workers
web = Vite + React + TanStack Router on Cloudflare Workers
sp  = Expo + Expo Router
lp  = Astro on Cloudflare Workers
```

完成時には、コピー直後に以下ができる状態にする。

- Bun workspaces として依存関係を管理できる
- Biomeでcheck/formatできる
- `apps/api` に `/health`, `/status`, `/echo` がある
- `web / sp` からAPI statusを表示できる
- `lp` からWeb appへCTAできる
- `packages/schema`, `packages/api-client`, `packages/env`, `packages/utils`, `packages/ui` が使える
- READMEとdocsで構成・起動・env・recipesを確認できる

## 実装ルール

- JSランタイムは **Bun** を使う。
- パッケージ管理、依存インストール、スクリプト実行、ワンショットCLIは **Bun** を使う。
- `npm` / `pnpm` / `yarn` / `npx` は使わない。
- ロックファイルは `bun.lock` を使う。
- モノレポはルート `package.json` の `workspaces` で `apps/*` と `packages/*` を扱う。
- formatter / linter / import整理は **Biome** を使う。
- coreのテストは **Bun test** を使う。
- CIは初期coreに入れない。
- DB / Auth / Cloudflare Access / OpenAPI は初期coreに入れず、recipesに置く。
- `apps/sp` は Bun first とする。ただし Expo / EAS / React Native 側でBun由来の問題が出た場合は、Expo公式CLIの要求に従う逃げ道をREADME/docsに明記する。
- `api / web / lp` はそれぞれ別Cloudflare Workerとして扱う。
- Workersで `web` のVite build、`lp` のAstro buildをどう配信するかは現時点では保留。実装中に必要になった場合は、決定内容をdocsに追記する。
- `example.com` をLPに使うかWebアプリに使うかは未決。envで差し替え可能にする。
- 各appは独立して削除しやすい構成にする。たとえば `lp` が不要なプロジェクトでは、`apps/lp` と関連script/env/docsを外せるように密結合を避ける。

## 技術スタック

| 領域               | 採用                           |
| ------------------ | ------------------------------ |
| Runtime / PM       | Bun                            |
| Workspace          | Bun workspaces                 |
| Formatter / Linter | Biome                          |
| API                | Hono                           |
| API deploy target  | Cloudflare Workers             |
| Web                | Vite + React + TanStack Router |
| Web deploy target  | Cloudflare Workers             |
| SP                 | Expo + Expo Router             |
| LP                 | Astro                          |
| CSS                | Tailwind CSS                   |
| API型共有          | Hono RPC                       |
| Schema             | Zod                            |
| Test               | Bun test                       |

## 実装する構成

```txt
DemoProject/four-app-monorepo-boilerplate/
├── apps/
│   ├── api/
│   ├── web/
│   ├── sp/
│   └── lp/
├── packages/
│   ├── schema/
│   ├── api-client/
│   ├── env/
│   ├── config/
│   ├── utils/
│   └── ui/
├── docs/
│   ├── architecture.md
│   ├── env.md
│   ├── development.md
│   ├── deployment.md
│   └── recipes/
├── README.md
├── package.json
├── bun.lock
├── biome.json
└── tsconfig.base.json
```

詳細なファイル構成は `docs/reference/directory_structure_v1.md` を正本とする。

## Package命名

workspace package名は `@repo/*` にする。

```txt
@repo/schema
@repo/api-client
@repo/env
@repo/config
@repo/utils
@repo/ui
```

## Path alias

- workspace packageは `@repo/*` importを使う。
- app内importには `@/` aliasを使えるようにする。
- `@api/*`, `@web/*`, `@shared/*` のような全体aliasは作らない。

## Root scripts

ルート `package.json` には、少なくとも次を用意する。

```json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
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

実装中に Bun workspace filter の挙動が合わない場合は、各workspaceを明示的に呼ぶ形へ調整し、READMEに理由を書く。

## API要件

`apps/api/src/app.ts` にHono appを作り、`AppType` をexportする。  
`apps/api/src/index.ts` はCloudflare Workers entryとして `export default app` を担う。

初期API:

```txt
GET  /health
GET  /status
POST /echo
```

`/health` は最小ヘルスチェック。  
`/status` は `web / sp / lp` のスターター表示向け。  
`/echo` はPOST疎通、Zod schema、Hono RPC、api-client確認用。

## Shared packages

### packages/schema

- Zod schema と shared types を置く。
- `src/api/status.ts`
- `src/api/echo.ts`
- `src/common/app-env.ts`
- `src/index.ts`
- 初期段階ではdomain別の深い構成にしない。

### packages/api-client

- Hono RPC wrapper + helper functions。
- `createApiClient(baseUrl)` を提供する。
- `status` helper と `echo` helper を提供する。
- React hooksは入れない。hooksが必要な場合は各app側で作る。

### packages/env

共通envだけを置く。app固有envは各appに置く。

共通env候補:

```env
APP_ENV=development
PUBLIC_SITE_URL=https://example.com
PUBLIC_APP_URL=https://app.example.com
PUBLIC_API_URL=https://api.example.com
PUBLIC_APP_NAME=My App
PUBLIC_SUPPORT_EMAIL=support@example.com
```

### packages/config

- `tsconfig/base.json`
- `tsconfig/react.json`
- `tsconfig/worker.json`
- `tsconfig/node.json`
- `cloudflare/README.md`

Biomeはroot `biome.json` に置く。Tailwindは `apps/web`, `apps/lp`, `packages/ui` 側の設定に寄せる。

### packages/utils

- 初期は `cn()` 程度。
- 汎用便利関数集にしない。

### packages/ui

`web / lp` 用のTailwind前提UIを置く。

初期コンポーネント:

- `button.tsx`
- `link-button.tsx`
- `card.tsx`
- `badge.tsx`
- `status-indicator.tsx`

`Input`, `Dialog`, `Toast`, `Tabs` などは初期coreに入れない。

## Apps

各 app の create コマンド・C3 テンプレート選択・作成後の調整は `docs/reference/app_scaffolding_v1.md` を正本とする。

### apps/api

- Hono on Cloudflare Workers。
- `src/app.ts`
- `src/index.ts`
- `wrangler.jsonc`
- `/health`, `/status`, `/echo`
- Bun testでAPI挙動を確認する。

### apps/web

- Vite + React + TanStack Router。
- `src/main.tsx`
- `src/router.tsx`
- `src/routes/__root.tsx`
- `src/routes/index.tsx`
- 初期画面でAPI statusを表示する。
- Tailwind CSS + `@repo/ui` を使う。
- Auth layoutは作り込みすぎない。

### apps/sp

- Expo + Expo Router。
- Expo Router files は `src/app/` に置く。
- `src/app/_layout.tsx`
- `src/app/index.tsx`
- `src/components/status-card.tsx`
- `src/lib/api.ts`
- 初期画面でAPI statusを表示する。
- tabs構成までは作り込まない。

### apps/lp

- Astro。
- `src/pages/index.astro`
- `src/layouts/base-layout.astro`
- `src/components/hero.astro`
- `src/components/cta.astro`
- `src/styles/global.css`
- CTAからWeb appへ遷移する。
- `features / pricing / faq` などのセクションは増やしすぎない。

## Docs / recipes

READMEは標準READMEにする。

READMEに含めるもの:

- overview
- apps
- packages
- setup
- scripts
- env
- docs links

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

recipesは手順 + コード例を書く。

初期recipes:

- `database.md`
- `auth.md`
- `cloudflare-access.md`
- `openapi.md`

recipe backlogとしてREADME/docsに残すもの:

- `storage-r2.md`
- `email.md`
- `database-d1.md`
- `kv.md`
- `queues.md`

## 実装しないもの

初期coreには次を入れない。

- CI
- DB / ORM
- Auth
- Cloudflare Access
- OpenAPI
- Stripe / payment
- R2 / storage
- KV / queues
- analytics
- email
- Vitest
- Jest
- Playwright
- React Testing Library
- Expo/Jest

## 実装完了条件

- [ ] `DemoProject/four-app-monorepo-boilerplate/` を単独ワークスペースとして開いて実装している。
- [ ] ルート `package.json` に Bun workspaces とroot scriptsがある。
- [ ] `bun.lock` がある。
- [ ] `biome.json` がある。
- [ ] `apps/api` に Hono app と `/health`, `/status`, `/echo` がある。
- [ ] `apps/web` が Vite + React + TanStack Routerで起動する。
- [ ] `apps/sp` が Expo + Expo Routerで起動する。
- [ ] `apps/lp` が Astroで起動する。
- [ ] `packages/schema`, `packages/api-client`, `packages/env`, `packages/config`, `packages/utils`, `packages/ui` がある。
- [ ] `web` からAPI statusを表示できる。
- [ ] `sp` からAPI statusを表示できる。
- [ ] `lp` のCTAがWeb appへ向く。
- [ ] READMEとdocsが作成されている。
- [ ] `docs/recipes/database.md`, `auth.md`, `cloudflare-access.md`, `openapi.md` がある。
- [ ] `bun install` が通る。
- [ ] `bun run check` が通る。
- [ ] `bun run typecheck` が通る。
- [ ] `bun run test` が通る。

## 実装時の注意

- `.env` や秘密情報をコミットしない。
- Cloudflareの実アカウント・実ドメイン・実secretsに依存しない。
- `wrangler.jsonc` のWorker名は `<project-name>-api`, `<project-name>-web`, `<project-name>-lp` のplaceholder思想で作る。
- `lp` が不要なプロジェクトで削除できるよう、`api / web / sp` から `apps/lp` へ密結合しない。
- `sp` が不要なプロジェクトでも削除しやすいよう、共有packageをReact Native専用に寄せすぎない。
- 採用済みの設計を変更した場合は、README/docsまたは別ドキュメントに理由と変更内容を残す。
