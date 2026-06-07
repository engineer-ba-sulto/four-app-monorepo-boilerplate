# Phase 4: README / docs 整備

- **チケット ID**: `2026-06-07_6`
- **作成日**: 2026-06-07
- **フェーズ**: Implementation Checklist Phase 4（Docs）
- **親チケット**: [2026-06-07_5_apps_sp.md](./2026-06-07_5_apps_sp.md)

## 完了条件

- [x] 標準 `README.md` を作成する（overview / apps / packages / setup / scripts / env / docs links）
- [x] `docs/architecture.md`, `docs/env.md`, `docs/development.md`, `docs/deployment.md` を作成する
- [x] `docs/recipes/` に database / auth / cloudflare-access / openapi の recipe を作成する
- [x] recipe backlog（storage-r2, email, database-d1, kv, queues）を README または docs に記載する
- [x] `apps/sp` の Bun first + Expo 互換逃げ道を README / docs に明記する

## 主担当

- Develop / Technical Officer（実装）

## 依頼内容

Phase 3（4 app 実装）完了後の **README / docs 整備**。

[implementation_checklist_v1.md](../../reference/implementation_checklist_v1.md) Phase 4 に沿い、起動手順・env・recipes をドキュメント化する。

### スコープ内

1. ルート README
2. `docs/` 配下の architecture / env / development / deployment
3. recipes と backlog 記載
4. Expo Bun 逃げ道の本文整備（Phase 3c 完了メモの候補を反映）

### スコープ外

- CI（初期 core 対象外）

## 優先度または期限

- 中（Phase 3 完了後）

## 現在の状態

- **完了**（2026-06-07）

## 関連ファイル

| 種別               | パス                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実装チェックリスト | [implementation_checklist_v1.md](../../reference/implementation_checklist_v1.md)（Phase 4）                                                          |
| Cursor 実装指示書  | [four_app_monorepo_boilerplate_cursor_implementation_instruction_v1.md](../../four_app_monorepo_boilerplate_cursor_implementation_instruction_v1.md) |

## 後続チケット

| ID             | 内容              | リンク                                                                  |
| -------------- | ----------------- | ----------------------------------------------------------------------- |
| `2026-06-07_7` | Phase 5: 最終検証 | [2026-06-07_7_verification.md](../../todo/2026-06-07_7_verification.md) |

## 完了メモ

### 実施内容

**ルート README**

- overview / apps / packages / setup / scripts / env / docs links を追加
- recipe backlog 表を記載
- Bun first + Expo 逃げ道、`dev:*` の `--filter` 形式の理由を明記

**docs/**

- `architecture.md` — 4 app 構成、データフロー、共有 package、Hono RPC
- `env.md` — 共通 env、app 別読み取り（wrangler / Vite / EXPO*PUBLIC*\*）
- `development.md` — 起動順、日常コマンド、SP Expo fallback、トラブルシュート
- `deployment.md` — Workers / EAS デプロイ概要

**docs/recipes/**

- `database.md`, `auth.md`, `cloudflare-access.md`, `openapi.md` — 手順 + コード例

**その他**

- `packages/config/cloudflare/README.md` の deployment リンクを更新

### 次の候補

- [2026-06-07_7_verification.md](../../todo/2026-06-07_7_verification.md)（Phase 5: 最終検証）
