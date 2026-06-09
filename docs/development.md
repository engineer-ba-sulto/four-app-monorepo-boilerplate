# Development

ローカル開発のワークフローと日常コマンド。

## Prerequisites

- [Bun](https://bun.com) 1.3+（`packageManager`: `bun@1.3.14`）
- Cloudflare Workers ローカル dev: Wrangler（`apps/api` 等に同梱）
- SP: [Expo CLI](https://docs.expo.dev/)（`bun run dev:sp` で起動）、iOS Simulator / Android Emulator または実機

## First-time setup

リポジトリをコピーした直後に、プロジェクト slug（リポジトリ名・Worker 名の接頭辞）を変える場合:

`init:project` は次を更新する:

- ルート `package.json` の `name`
- `apps/*/package.json` の `name`（`api` / `web` / `lp` は `<slug>-<app>`、`sp` は `<slug>`。各 `dev:*` は path filter に切り替え）
- workspace 依存（例: `web` / `sp` の `api`）と `api/app` import の追従
- `apps/sp/app.json` の Expo `slug` / `name` / `scheme`
- `apps/api` / `apps/web` / `apps/lp` の `wrangler.jsonc` の Worker `name`（`<slug>-api` など）
- `README.md` のタイトル

```bash
bun run init:project my-cool-app   # コピー直後のみ（任意）
bun install
bun run typecheck
bun run check
bun run test
```

## Running apps

### Recommended order

1. **API** — web / sp が `/status` を呼ぶため先に起動
2. **Web / SP / LP** — 任意の組み合わせ

```bash
bun run dev:api    # http://localhost:8787
bun run dev:web    # http://localhost:5173
bun run dev:sp     # Expo dev server
bun run dev:lp     # http://localhost:4321
```

全 app 一括起動（mprocs で pane 分割 UI、各 app のログを切り替えて確認）:

```bash
bun run dev
```

[mprocs](https://github.com/pvolok/mprocs) を使う。キーマップはルートの `mprocs.yaml` でカスタムしている。

| キー      | 動作                                      |
| --------- | ----------------------------------------- |
| `Tab`     | プロセス一覧 ⇔ 出力ペインのフォーカス切替 |
| `↑` / `↓` | プロセス選択（`j` / `k` は無効）          |
| `q`       | 全プロセス停止して終了                    |

その他の操作（`s` 起動、`x` 停止、`r` 再起動、`z` 全画面など）は mprocs デフォルト。一覧は起動中に画面下部のヘルプ、または [mprocs README](https://github.com/pvolok/mprocs#default-keymap) を参照。

| App           | URL                          |
| ------------- | ---------------------------- |
| API           | http://localhost:8787/status |
| Web           | http://localhost:5173/       |
| LP            | http://localhost:4321/       |
| SP (Expo web) | http://localhost:8081/       |

| 起動方法        | 向いている用途              |
| --------------- | --------------------------- |
| `bun run dev`   | 全 app を mprocs で並列起動 |
| `bun run dev:*` | 1 app だけ起動              |

### Per-app commands

| App | Dev               | Build                        | Typecheck                        | Test                        |
| --- | ----------------- | ---------------------------- | -------------------------------- | --------------------------- |
| api | `bun run dev:api` | —                            | `bun run --filter api typecheck` | `bun run --filter api test` |
| web | `bun run dev:web` | `bun run --filter web build` | `bun run --filter web typecheck` | —                           |
| sp  | `bun run dev:sp`  | `bun run --filter sp build`  | `bun run --filter sp typecheck`  | —                           |
| lp  | `bun run dev:lp`  | `bun run --filter lp build`  | `bun run --filter lp typecheck`  | —                           |

ルートから一括:

```bash
bun run build
bun run typecheck
bun run test
```

## Lint and format

Biome はルート `biome.json` で monorepo 全体をカバーする。

```bash
bun run check        # lint + format チェック
bun run check:fix    # 自動修正
bun run format:fix   # format のみ修正
```

`apps/sp` の Expo 由来 ESLint は削除済み。SP もルート Biome に統一。

## Workspace packages

新しい workspace package を追加する場合:

1. `packages/<name>/package.json` で `"name": "@repo/<name>"` を設定
2. ルート `workspaces` は `packages/*` で自動包含
3. 利用側 app の `dependencies` に `"@repo/<name>": "workspace:*"` を追加
4. `bun install`

Import は `@repo/*` を使う。app 内は `@/` alias（各 app の tsconfig で設定）。

## API development

```bash
cd apps/api   # または bun run --filter api <script>
bun test      # /health, /status, /echo のテスト
```

Hono app は `apps/api/src/app.ts`。Workers entry は `apps/api/src/index.ts`。

型生成:

```bash
bun run --filter api cf-typegen
```

## Web development

TanStack Router のファイルベース routing: `apps/web/src/routes/`。

API client:

```typescript
import { createApiClient } from "@repo/api-client";
import type { AppType } from "api/app";
import { getWebEnv } from "@/lib/env";

const client = createApiClient<AppType>(getWebEnv().PUBLIC_API_URL);
```

## SP development (Expo)

- Router files: `apps/sp/src/app/`（`_layout.tsx`, `index.tsx`）
- Metro monorepo 設定: `apps/sp/metro.config.js`（watchFolders / nodeModulesPaths）
- tsconfig: `packages/config/tsconfig/react.json` を extends + `customConditions: ["react-native"]`

### Bun first + Expo fallback

日常の install / script 実行は **Bun** を使う。

EAS Build、`expo prebuild`、ネイティブ toolchain で Bun 起因の問題が出た場合は、[Expo 公式ドキュメント](https://docs.expo.dev/) に従い、**該当コマンドのみ** npm / yarn / npx で実行する。

例:

```bash
# 通常（Bun）
bun run dev:sp

# 逃げ道（Expo 公式が npm/npx を要求する場合）
npx expo prebuild
npx eas build --platform ios
```

env は `EXPO_PUBLIC_*`。詳細は [env.md](./env.md)。

## LP development

Astro pages: `apps/lp/src/pages/`。CTA は `PUBLIC_APP_URL` を参照。

## Removing an app

不要な app を外す例（`lp`）:

1. `apps/lp` ディレクトリを削除
2. ルート `package.json` から `dev:lp` を削除
3. 他 app から `lp` への hard dependency が無いことを確認
4. README / docs を更新

## Troubleshooting

| Issue                          | Check                                                               |
| ------------------------------ | ------------------------------------------------------------------- |
| web/sp が API に接続できない   | API が起動しているか、`PUBLIC_API_URL` / `EXPO_PUBLIC_API_URL`      |
| workspace package が解決しない | `bun install`、import が `@repo/*` か                               |
| `dev:sp` が動かない            | `bun run --filter sp dev` 形式か（`bun --cwd` は Bun 1.3 で不具合） |
| Expo env が反映されない        | Metro 再起動、`.env` の `EXPO_PUBLIC_*` プレフィックス              |

## Related

- [env.md](./env.md)
- [architecture.md](./architecture.md)
- [reference/app_scaffolding_v1.md](./reference/app_scaffolding_v1.md)
