# Phase 1: Root Workspace

- **チケット ID**: `2026-06-07_1`
- **作成日**: 2026-06-07
- **完了日**: 2026-06-07
- **フェーズ**: Implementation Checklist Phase 1

## 完了条件

- [x] ルート [`package.json`](../../../package.json) に Bun `workspaces: ["apps/*", "packages/*"]` がある
- [x] ルート `package.json` から Bun テンプレ由来の不要項目（例: `"module": "index.ts"`、`packageManager` の yarn 表記）を整理し、**Bun + `bun.lock` 一本**にする
- [x] ルート `package.json` に次の scripts がある:
  - [x] `dev`, `dev:api`, `dev:web`, `dev:sp`, `dev:lp`
  - [x] `build`, `typecheck`, `test`, `test:watch`
  - [x] `check`, `check:fix`, `lint`, `lint:fix`, `format`, `format:fix`
- [x] ルートで `bun add -D -E @biomejs/biome` 済み（workspace パッケージへ重複追加しない）
- [x] ルート [`biome.json`](../../../biome.json) がある（schema バージョンはインストール済み Biome と一致）
- [x] Biome 設定にモノレポ向け項目がある（`vcs`, Tailwind directives, Astro HTML 整形, organizeImports 等）— 手順は [bun-biome-setup スキル](../../../.cursor/skills/bun-biome-setup/SKILL.md)
- [x] ルート [`tsconfig.base.json`](../../../tsconfig.base.json) がある（Bun 初期 [`tsconfig.json`](../../../tsconfig.json) との統合方針を決めて反映）
- [x] ルートで `bun install` し、**単一の [`bun.lock`](../../../bun.lock)** に依存を統合する
- [x] `bun run check` がエラー 0 で通る
- [x] Bun workspace filter（`bun run --filter '*'`）の挙動を確認し、問題があれば scripts を調整して理由を記録する

## 主担当

- Develop / Technical Officer（実装）

## 依頼内容

four-app-monorepo-boilerplate の **Phase 1: Root Workspace** を実装する。

モノレポの骨組み（Bun workspaces、Biome、tsconfig 基底、ルート scripts、lock 一本化）を先に整え、以降の app scaffold・共有 package 追加の前提を満たす。

### スコープ内

1. ルート workspace 設定と scripts
2. Biome 導入（[tooling_tsconfig_biome_v1.md](../../reference/tooling_tsconfig_biome_v1.md)、[bun-biome-setup スキル](../../../.cursor/skills/bun-biome-setup/SKILL.md)）
3. `tsconfig.base.json` 作成（`packages/config/tsconfig/*` の 4 preset は **Phase 2**）

### スコープ外（後続フェーズ）

- `packages/config/tsconfig/*` の 4 preset（Phase 2）
- `packages/schema` 等の共有 package 実装（Phase 2）
- `apps/web` / `apps/lp` / `apps/sp` の scaffold（Phase 3）
- `apps/api` の `/health`, `/status`, `/echo` 実装（Phase 3）

## 優先度または期限

- 最優先（app scaffolding の前提）

## 現在の状態

- **完了**（2026-06-07）
- ルート workspace・Biome・tsconfig 基底・scripts・単一 `bun.lock` を整備済み

## 関連ファイル

| 種別                       | パス                                                                                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実装チェックリスト Phase 1 | [implementation_checklist_v1.md](../../reference/implementation_checklist_v1.md)                                                                               |
| tsconfig / Biome 方針      | [tooling_tsconfig_biome_v1.md](../../reference/tooling_tsconfig_biome_v1.md)                                                                                   |
| app scaffold 前提          | [app_scaffolding_v1.md](../../reference/app_scaffolding_v1.md)                                                                                                 |
| Cursor 実装指示書          | [four_app_monorepo_boilerplate_cursor_implementation_instruction_v1.md](../../reference/four_app_monorepo_boilerplate_cursor_implementation_instruction_v1.md) |
| Biome 導入手順             | [bun-biome-setup/SKILL.md](../../../.cursor/skills/bun-biome-setup/SKILL.md)                                                                                   |
| モノレポ仕様               | [monorepo_boilerplate_spec_v1.md](../../reference/monorepo_boilerplate_spec_v1.md)                                                                             |

## 後続チケット

| ID             | 内容                                                          | リンク                                                                        |
| -------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `2026-06-07_2` | Phase 2: Shared Packages（`packages/config/tsconfig/*` 含む） | [2026-06-07_2_shared_packages.md](../../todo/2026-06-07_2_shared_packages.md) |
| `2026-06-07_3` | Phase 3a: apps/api                                            | [2026-06-07_3_apps_api.md](../../todo/2026-06-07_3_apps_api.md)               |
| `2026-06-07_4` | Phase 3b: apps/web + apps/lp                                  | [2026-06-07_4_apps_web_lp.md](2026-06-07_4_apps_web_lp.md)                    |
| `2026-06-07_5` | Phase 3c: apps/sp                                             | [2026-06-07_5_apps_sp.md](../../todo/2026-06-07_5_apps_sp.md)                 |

## 完了メモ

### 実施内容

- ルート `package.json` に `workspaces` と全 scripts を追加。Bun テンプレの `"module": "index.ts"` と `index.ts` を削除。
- `@biomejs/biome@2.4.16`（exact pin）と `typescript@6.0.3` をルート `devDependencies` に追加。
- `biome.json` をモノレポ向け設定（vcs, Tailwind directives, Astro HTML, organizeImports）で作成。
- `tsconfig.base.json` に Bun 初期テンプレの `compilerOptions` を移し、`tsconfig.json` は `extends` のみに整理（Phase 2 で各 preset が `base` を参照する前提）。
- `apps/`, `packages/` 空ディレクトリを作成（workspace glob の受け皿）。

### tsconfig 統合方針

- **正本**: `tsconfig.base.json`（共有 `compilerOptions`）
- **ルート `tsconfig.json`**: `extends: ./tsconfig.base.json`, `include: []`（ルートに TS ソースなし）
- Phase 2 の `packages/config/tsconfig/*` がこの base を参照する想定

### Bun workspace filter の確認結果

- `bun run --filter '*' dev|build|typecheck` は、**workspace 内に `package.json` を持つパッケージが 0 件の現状**では `error: No packages matched the filter` で終了する。
- 仕様どおり scripts は維持。Phase 2/3 で `@repo/*` と `apps/*` を追加すれば filter が有効になる。
- `dev:api` 等の `bun --cwd apps/<app> run dev` は、対象 app の `package.json` 未作成時はルート scripts 一覧を表示するのみ（Phase 3 scaffold 後に各 app で解消）。

### 検証

- `bun install` — 単一 `bun.lock` で完了
- `bun run check` — エラー 0

### 次の候補

- [2026-06-07_2_shared_packages.md](../../todo/2026-06-07_2_shared_packages.md)（Phase 2: 共有 package + tsconfig preset）
