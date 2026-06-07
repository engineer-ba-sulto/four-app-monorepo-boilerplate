# Tooling: tsconfig / Biome v1

- Date: 2026-06-07
- Status: Planned（未実装）
- Related:
  - `implementation_checklist_v1.md` — Phase 1, 2
  - `monorepo_boilerplate_spec_v1.md`
  - `app_scaffolding_v1.md`
  - `four_app_monorepo_boilerplate_cursor_implementation_instruction_v1.md`
  - `.cursor/skills/bun-biome-setup/SKILL.md` — Biome 導入手順（Cursor スキル）

## 方針サマリ

- **TypeScript**: `packages/config/tsconfig/*` に preset を集約。各 workspace が `extends` する。tsconfig 用の Cursor スキルはない。本ドキュメントを正本とする。
- **Biome**: ルート `biome.json` のみ。ESLint / Prettier は使わない。導入手順は `.cursor/skills/bun-biome-setup/SKILL.md` を正本とする。
- **検証**: `bun run check`（Biome）と `bun run typecheck`（TS）を分離してルートから一括実行。

## 現状ギャップ

| 項目    | 計画                                                       | 現状（2026-06-07 時点）                              |
| ------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| TS      | ルート `tsconfig.base.json` + `packages/config/tsconfig/*` | ルート `tsconfig.json`（Bun 初期テンプレート）のみ   |
| Biome   | ルート `biome.json` + `@biomejs/biome`                     | 未作成                                               |
| scripts | `check`, `typecheck` 等                                    | ルート `package.json` に workspaces / scripts 未整備 |

## tsconfig 構成（計画）

### ファイル配置

```txt
four-app-monorepo-boilerplate/
├── tsconfig.base.json
└── packages/config/tsconfig/
    ├── base.json
    ├── react.json
    ├── worker.json
    └── node.json
```

各 app / package は個別の `tsconfig.json` を持ち、上記 preset を `extends` する。

### preset 用途（推定・実装時に確定）

| preset        | 想定利用先                                                                             |
| ------------- | -------------------------------------------------------------------------------------- |
| `base.json`   | `packages/schema`, `packages/env`, `packages/utils`, `packages/api-client` 等の共有 TS |
| `react.json`  | `apps/web`, `packages/ui`、必要なら `apps/sp`                                          |
| `worker.json` | `apps/api`, `apps/web`, `apps/lp`（Cloudflare Workers）                                |
| `node.json`   | ビルドスクリプト等（必要になったら）                                                   |

### Path alias

- workspace package: `@repo/*` import
- app 内: `@/` alias を許可
- `@api/*`, `@web/*`, `@shared/*` のような全体 alias は作らない

### 未決（実装時に決める）

- 各 preset の `compilerOptions` 詳細（strict フラグ、`jsx`、`types: ["@cloudflare/workers-types"]` 等）
- `apps/web` が `react.json` と `worker.json` をどう合成するか
- 各 app の `@/` alias を tsconfig / bundler（Vite / Astro / Expo）のどちらで定義するか
- ルート `tsconfig.json`（Bun 初期）を `tsconfig.base.json` に置き換えるか、統合するか

## Biome 構成（計画）

### 配置

- ルート `biome.json` のみ（package 単位には置かない）
- 依存: ルート `devDependencies` に `@biomejs/biome`（exact pin 推奨）

### ルート scripts

```json
{
  "check": "biome check .",
  "check:fix": "biome check . --write",
  "lint": "biome check .",
  "lint:fix": "biome check . --write",
  "format": "biome format .",
  "format:fix": "biome format . --write"
}
```

### C3 / Expo scaffold 後

- C3 が付与する ESLint など、ルート Biome と重複するツールは整理する（`app_scaffolding_v1.md`）
- 初期 core には ESLint / Prettier / Vitest / Jest を入れない

### Biome 導入スキル

Biome の依存追加・`biome.json`・ルート scripts・ESLint 置換は、本リポジトリの Cursor スキルを手順の正本とする。

- パス: `.cursor/skills/bun-biome-setup/SKILL.md`
- スキル名: `bun-biome-setup`
- 対象: Bun モノレポ（本 boilerplate）および Vite 単体

方針（ルート 1 本のみ、ESLint 不使用）と preset との関係は **本ドキュメント** を優先する。スキルと本ドキュメントが食い違う場合は、本ドキュメントの方針に合わせてスキル手順を適用する。

本ドキュメントには Biome の詳細設定値は未記載。実装時は上記スキルに従い、次の設定項目を本プロジェクト向けに確定する。

想定される設定項目:

- `css.parser.tailwindDirectives` — Tailwind CSS（`apps/web`, `apps/lp`, `packages/ui`）
- `html.experimentalFullSupportEnabled` — Astro LP（`.astro` の HTML 整形）
- `assist.actions.source.organizeImports: "on"` — import 自動整理
- `vcs.enabled: true` + `useIgnoreFile: true` — `.gitignore` 連携

Tailwind 本体の設定は Biome ではなく `apps/web`, `apps/lp`, `packages/ui` 側に置く。

## 実装順序

`app_scaffolding_v1.md` の Recommended Order に沿う。

1. **Phase 1**: ルート `package.json` workspaces + `biome.json` + `tsconfig.base.json` + scripts
2. **Phase 2**: `packages/config/tsconfig/*`（4 preset）
3. **Phase 3**: 各 app scaffold 後、個別 `tsconfig.json` を preset に寄せる + ESLint 整理
4. **Phase 5**: `bun run check` / `typecheck` / `test` 通過

## 完了条件

- [ ] ルート `biome.json` が存在する
- [ ] `packages/config/tsconfig/` に 4 preset がある
- [ ] 各 app / package に `tsconfig.json` がある
- [ ] `bun run check` が通る
- [ ] `bun run typecheck` が通る
- [ ] C3 由来の ESLint 等が残っていない

## 初期 core に入れないもの

- CI
- ESLint / Prettier
- Vitest / Jest / Playwright / React Testing Library

手元検証は README で `bun run check` / `typecheck` / `test` を案内する。
