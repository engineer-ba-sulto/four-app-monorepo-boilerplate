# Phase 5: Verification

- **チケット ID**: `2026-06-07_7`
- **作成日**: 2026-06-07
- **フェーズ**: Implementation Checklist Phase 5（Verification）
- **親チケット**: [2026-06-07_6_docs_readme.md](./2026-06-07_6_docs_readme.md)

## 完了条件

- [x] `bun install` が通る
- [x] `bun run check` が通る
- [x] `bun run typecheck` が通る
- [x] `bun run test` が通る
- [x] `bun run dev:api` で API が起動する
- [x] `bun run dev:web` で Web が起動する
- [x] `bun run dev:sp` で SP が起動する
- [x] `bun run dev:lp` で LP が起動する
- [x] `web` から API status を表示できる
- [x] `sp` から API status を表示できる
- [x] `lp` の CTA が Web app を指す

## 主担当

- Develop / Technical Officer（実装）

## 依頼内容

Phase 4（README / docs）完了後の **最終検証**。implementation checklist Phase 5 に沿い、全 workspace の build / dev / 疎通を確認する。

### スコープ内

1. ルート script の一括検証
2. 各 app の dev 起動確認
3. web / sp → API、lp → web の疎通確認

### スコープ外

- CI 導入
- 本番デプロイ

## 優先度または期限

- 中（Phase 4 完了後）

## 現在の状態

- **完了**（2026-06-07）

## 関連ファイル

| 種別               | パス                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| 実装チェックリスト | [implementation_checklist_v1.md](../../reference/implementation_checklist_v1.md)（Phase 5） |
| 開発手順           | [development.md](../../development.md)                                                      |

## 後続チケット

boilerplate 初期実装完了後は、プロジェクト固有の機能チケットへ移行。

## 完了メモ

### 実施内容

**ルート script（4 項）**

- `bun install` / `check` / `typecheck` / `test` — すべて成功（test 19 pass）

**dev 起動（4 項）**

- `dev:api` → `http://localhost:8787`
- `dev:web` → `http://localhost:5173`
- `dev:sp` → `http://localhost:8081`（Expo web）
- `dev:lp` → `http://localhost:4321`（ポート競合時は 4322+ にフォールバック）

**疎通（3 項）**

- web: `api v0.0.0 (development)` を表示
- sp（Expo web）: `api v0.0.0 (development)` を表示
- lp: CTA `Open Web App` → `http://localhost:5173/`

### 検証中の修正

疎通確認のため以下を追加・修正した。

| 変更                                                                                       | 理由                                                 |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `apps/web/.env.example`, `apps/lp/.env.example`, `apps/sp/.env.example`                    | ローカル dev 用 env テンプレート（docs/env.md 参照） |
| `apps/web/vite.config.ts`, `apps/lp/astro.config.mjs` に `envPrefix: ["PUBLIC_", "VITE_"]` | Vite が `PUBLIC_*` をクライアントに渡すため          |
| `apps/api/src/app.ts` に `hono/cors`                                                       | web / sp ブラウザからの cross-origin fetch 用        |

ローカル dev では各 app の `.env.example` を `.env` にコピーしてから dev 起動する。

### 次の候補

boilerplate 初期実装完了。プロジェクト固有の機能チケットへ移行。
