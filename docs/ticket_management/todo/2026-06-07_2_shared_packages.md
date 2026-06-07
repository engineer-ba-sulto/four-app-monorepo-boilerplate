# Phase 2: Shared Packages

- **チケット ID**: `2026-06-07_2`
- **作成日**: 2026-06-07
- **フェーズ**: Implementation Checklist Phase 2
- **親チケット**: [2026-06-07_1_root_workspace.md](../done/2026-06-07/2026-06-07_1_root_workspace.md)

## 完了条件

- [ ] `packages/config` に 4 tsconfig preset（`base`, `react`, `worker`, `node`）と `cloudflare/README.md` がある
- [ ] `packages/schema` に Zod schema・Bun test がある
- [ ] `packages/env` に共通 env schema・Bun test がある
- [ ] `packages/utils` に `cn()`・Bun test がある
- [ ] `packages/ui` に starter UI コンポーネント（button, link-button, card, badge, status-indicator）がある
- [ ] `packages/api-client` に Hono RPC wrapper と status/echo helper がある（React hooks なし）
- [ ] 各 package が `@repo/*` 命名で workspace に登録されている
- [ ] `bun run --filter '*' typecheck` が通る（workspace パッケージ追加後）

## 主担当

- Develop / Technical Officer（実装）

## 依頼内容

four-app-monorepo-boilerplate の **Phase 2: Shared Packages** を実装する。

`packages/config`, `schema`, `env`, `utils`, `ui`, `api-client` を追加し、Phase 3 の app scaffold の前提を満たす。

### スコープ内

1. `packages/config/tsconfig/*`（4 preset）
2. 共有 package 6 件の実装と Bun test
3. 各 package の `tsconfig.json`（preset を `extends`）

### スコープ外（後続フェーズ）

- `apps/*` の scaffold（Phase 3）
- README / docs 整備（Phase 5 相当）

## 優先度または期限

- 高（app scaffolding の直前）

## 現在の状態

- **未着手**
- ルート workspace（Phase 1）は完了済み

## 関連ファイル

| 種別                       | パス                                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実装チェックリスト Phase 2 | [implementation_checklist_v1.md](../../reference/implementation_checklist_v1.md)                                                                     |
| tsconfig / Biome 方針      | [tooling_tsconfig_biome_v1.md](../../reference/tooling_tsconfig_biome_v1.md)                                                                         |
| モノレポ仕様               | [monorepo_boilerplate_spec_v1.md](../../reference/monorepo_boilerplate_spec_v1.md)                                                                   |
| Cursor 実装指示書          | [four_app_monorepo_boilerplate_cursor_implementation_instruction_v1.md](../../four_app_monorepo_boilerplate_cursor_implementation_instruction_v1.md) |

## 後続チケット

| ID             | 内容                         | リンク                                                      |
| -------------- | ---------------------------- | ----------------------------------------------------------- |
| `2026-06-07_3` | Phase 3a: apps/api           | [2026-06-07_3_apps_api.md](2026-06-07_3_apps_api.md)       |
| `2026-06-07_4` | Phase 3b: apps/web + apps/lp | [2026-06-07_4_apps_web_lp.md](2026-06-07_4_apps_web_lp.md) |
| `2026-06-07_5` | Phase 3c: apps/sp            | [2026-06-07_5_apps_sp.md](2026-06-07_5_apps_sp.md)         |

## 完了メモ

（完了時に記入）
