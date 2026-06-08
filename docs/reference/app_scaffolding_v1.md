# App Scaffolding v1

- Date: 2026-06-07
- Status: Final
- Related spec: `monorepo_boilerplate_spec_v1.md`
- Related structure: `directory_structure_v1.md`
- Implementation directory: `DemoProject/four-app-monorepo-boilerplate/`

各 app の初期プロジェクトは、手書きではなく **create コマンドで土台を作り**、仕様どおりの構成へ寄せる。

## Summary

| App   | Create コマンド                | C3 / テンプレート選択             |
| ----- | ------------------------------ | --------------------------------- |
| `api` | `bun create cloudflare@latest` | **Hono**                          |
| `web` | `bun create cloudflare@latest` | **React**                         |
| `lp`  | `bun create cloudflare@latest` | **Astro**                         |
| `sp`  | `bun create expo-app`          | **`default`**（Expo Router 付き） |

```txt
api = Hono on Cloudflare Workers
web = Vite + React + TanStack Router on Cloudflare Workers
sp  = Expo + Expo Router
lp  = Astro on Cloudflare Workers
```

## Preconditions

1. ルート workspace（`package.json` の `workspaces`, `biome.json`, `tsconfig.base.json`）を先に用意する。
2. 各 app は `apps/<name>/` に作る。
3. パッケージマネージャは **Bun** のみ。`npm` / `pnpm` / `yarn` / `npx` は使わない。
4. 作成後はルートで `bun install` し、**単一の `bun.lock`** に統合する。
5. C3 が付与する ESLint など、ルート Biome と重複するツールは整理する。

## Commands

モノレポルートから実行する例。

### apps/api

```bash
bun create cloudflare@latest apps/api -- --template hono --lang ts
```

対話式で進める場合:

- category: Framework Starter（または相当）
- framework: **Hono**

### apps/web

```bash
bun create cloudflare@latest apps/web -- --framework react --lang ts
```

対話式で進める場合:

- framework: **React**

### apps/lp

```bash
bun create cloudflare@latest apps/lp -- --framework astro --lang ts
```

対話式で進める場合:

- framework: **Astro**

### apps/sp

```bash
bun create expo-app apps/sp -- --template default
```

- `bun create expo-app` は `create-expo-app` を呼ぶ。
- **`default`** を使う（Expo Router + TypeScript）。
- **`tabs` は使わない**（仕様では tabs 構成まで作り込まない）。
- Expo SDK 55 以降の `default` は `src/app/` 前提で、仕様と合いやすい。
- SDK 54 系で `app/` 直下になる場合は `src/app/` へ移す。

## C3 Framework Selection

`bun create cloudflare@latest` の「Which development framework do you want to use?」画面では、次を選ぶ。

| 作る app | 選ぶ項目  | 選ばない項目                                  |
| -------- | --------- | --------------------------------------------- |
| `api`    | **Hono**  | React, Astro など他フレームワーク             |
| `web`    | **React** | React Router (formerly Remix), TanStack Start |
| `lp`     | **Astro** | React, Hono など他フレームワーク              |

### web で TanStack Start を選ばない理由

仕様は **TanStack Router + Vite + React**。

- **TanStack Start** は別フレームワークで、Router 単体ではない。
- **React Router (formerly Remix)** もルーティング前提が異なる。

C3 の React テンプレートを土台にし、作成後に TanStack Router を追加する。

## Post-Scaffolding Adjustments

create 直後はそのままでは仕様未達。各 app で次を行う。

### apps/api

- `src/app.ts` と `src/index.ts` に分離する（C3 Hono は 1 ファイルのことが多い）。
- `AppType` を export する。
- `GET /health`, `GET /status`, `POST /echo` を実装する。
- `wrangler.jsonc` の Worker 名を `<project-name>-api` placeholder 思想に合わせる。

### apps/web

- **TanStack Router** を追加する。
- 次の構成に寄せる:
  - `src/main.tsx`
  - `src/router.tsx`
  - `src/routes/__root.tsx`
  - `src/routes/index.tsx`
- Tailwind CSS と `@repo/ui` を接続する。
- 初期画面で API status を表示する。
- `wrangler.jsonc` の Worker 名を `<project-name>-web` placeholder 思想に合わせる。

### apps/sp

- Expo Router files を `src/app/` に置く。
- 次を追加する:
  - `src/app/_layout.tsx`
  - `src/app/index.tsx`
  - `src/components/status-card.tsx`
  - `src/lib/api.ts`
- 初期画面で API status を表示する。
- `@/` alias を使えるなら設定する。
- Bun first だが、Expo / EAS / React Native 側で Bun 由来の問題が出た場合は Expo 公式 CLI の要求に従う（README / docs に逃げ道を書く）。

### apps/lp

- 次の薄い LP 構成に寄せる:
  - `src/pages/index.astro`
  - `src/layouts/base-layout.astro`
  - `src/components/hero.astro`
  - `src/components/cta.astro`
  - `src/styles/global.css`
- Tailwind CSS と `@repo/ui` を接続する。
- CTA から Web app へ遷移する。
- `wrangler.jsonc` の Worker 名を `<project-name>-lp` placeholder 思想に合わせる。

## Monorepo Integration

1. 各 app の `package.json` をルート `workspaces: ["apps/*", "packages/*"]` に含める。
2. ルートで `bun install` して依存を一本化する。
3. ルート scripts（`dev:api`, `dev:web`, `dev:sp`, `dev:lp`）から各 app を起動できるようにする。
4. C3 作成時の即時デプロイは boilerplate 作成中は避ける（必要なら `--no-deploy` 等を確認する）。

## Recommended Order

```txt
1. ルート workspace（package.json, biome.json, tsconfig.base.json）
2. apps/api  → C3 Hono
3. apps/lp   → C3 Astro
4. apps/web  → C3 React → TanStack Router へ寄せる
5. apps/sp   → create-expo-app（default テンプレート）
6. packages/* を追加して @repo/* を接続
7. ルートで bun install / check / typecheck / test
```

## Related

- `monorepo_boilerplate_spec_v1.md` — 各 app の技術スタックと要件
- `directory_structure_v1.md` — 完成時のディレクトリ構成
- `implementation_checklist_v1.md` — Phase 3 の実装チェックリスト
