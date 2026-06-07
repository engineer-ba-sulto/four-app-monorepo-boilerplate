# Phase 1: Root Workspace

- **チケット ID**: `2026-06-07_1`
- **作成日**: 2026-06-07
- **フェーズ**: Implementation Checklist Phase 1

## 完了条件

- [ ] ルート [`package.json`](../../../package.json) に Bun `workspaces: ["apps/*", "packages/*"]` がある
- [ ] ルート `package.json` から Bun テンプレ由来の不要項目（例: `"module": "index.ts"`、`packageManager` の yarn 表記）を整理し、**Bun + `bun.lock` 一本**にする
- [ ] ルート `package.json` に次の scripts がある:
  - [ ] `dev`, `dev:api`, `dev:web`, `dev:sp`, `dev:lp`
  - [ ] `build`, `typecheck`, `test`, `test:watch`
  - [ ] `check`, `check:fix`, `lint`, `lint:fix`, `format`, `format:fix`
- [ ] ルートで `bun add -D -E @biomejs/biome` 済み（workspace パッケージへ重複追加しない）
- [ ] ルート [`biome.json`](../../../biome.json) がある（schema バージョンはインストール済み Biome と一致）
- [ ] Biome 設定にモノレポ向け項目がある（`vcs`, Tailwind directives, Astro HTML 整形, organizeImports 等）— 手順は [bun-biome-setup スキル](../../../.cursor/skills/bun-biome-setup/SKILL.md)
- [ ] ルート [`tsconfig.base.json`](../../../tsconfig.base.json) がある（Bun 初期 [`tsconfig.json`](../../../tsconfig.json) との統合方針を決めて反映）
- [ ] ルートで `bun install` し、**単一の [`bun.lock`](../../../bun.lock)** に依存を統合する
- [ ] `bun run check` がエラー 0 で通る
- [ ] Bun workspace filter（`bun run --filter '*'`）の挙動を確認し、問題があれば scripts を調整して理由を記録する

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

- **未着手**
- ルート: `workspaces` / `biome.json` / `tsconfig.base.json` なし
- `apps/*` は未作成（Phase 3 で scaffold）

## 関連ファイル

| 種別                       | パス                                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実装チェックリスト Phase 1 | [implementation_checklist_v1.md](../../reference/implementation_checklist_v1.md)                                                                     |
| tsconfig / Biome 方針      | [tooling_tsconfig_biome_v1.md](../../reference/tooling_tsconfig_biome_v1.md)                                                                         |
| app scaffold 前提          | [app_scaffolding_v1.md](../../reference/app_scaffolding_v1.md)                                                                                       |
| Cursor 実装指示書          | [four_app_monorepo_boilerplate_cursor_implementation_instruction_v1.md](../../four_app_monorepo_boilerplate_cursor_implementation_instruction_v1.md) |
| Biome 導入手順             | [bun-biome-setup/SKILL.md](../../../.cursor/skills/bun-biome-setup/SKILL.md)                                                                         |
| モノレポ仕様               | [monorepo_boilerplate_spec_v1.md](../../reference/monorepo_boilerplate_spec_v1.md)                                                                   |

## 後続チケット

Phase 1 完了時に、未作成なら `todo` へ起票する。

| 予定 ID        | 内容                                                          | 状態   |
| -------------- | ------------------------------------------------------------- | ------ |
| `2026-06-07_2` | Phase 2: Shared Packages（`packages/config/tsconfig/*` 含む） | 未作成 |
| `2026-06-07_3` | Phase 3: Apps（scaffold・API エンドポイント・各 app 調整）    | 未作成 |

## 完了メモ

（完了時に記入）
