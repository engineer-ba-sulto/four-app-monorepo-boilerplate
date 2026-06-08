---
name: bun-biome-setup
description: Introduces Biome with Bun (bun add, bun run, bunx) — biome.json, package scripts, and initial formatting. Use when adding Biome with Bun, setting up biome.json, replacing ESLint/Prettier, Vite or Astro projects, or when the user mentions Bun Biome setup, lint/format setup.
---

# Biome 導入

Bun プロジェクトに Biome を導入する手順。次のどちらにも対応する。

**four-app-monorepo-boilerplate** では、方針・tsconfig との関係の正本は `docs/reference/tooling_tsconfig_biome_v1.md`。本スキルは Biome 導入の手順正本とする。

| 種別             | 例                                             | 備考                                            |
| ---------------- | ---------------------------------------------- | ----------------------------------------------- |
| **Bun モノレポ** | ルート `workspaces` + `apps/*`（Astro LP 等）  | Biome はルート 1 本のみ                         |
| **Vite 単体**    | `vite` / `@vitejs/plugin-react`、ルート `src/` | `create vite` テンプレの ESLint を Biome に置換 |

前提: JS ランタイム・パッケージ操作は **Bun**（`npm` / `pnpm` / `yarn` / `npx` は使わない）。

## 手順

### 1. 依存追加

プロジェクトルートで実行:

```bash
bun add -D -E @biomejs/biome
```

`-E` で exact pin。`devDependencies` に `"@biomejs/biome": "<version>"` が入る。

モノレポでは **ルートのみ** に追加し、各 workspace には重複しない。

### 2. `biome.json` 作成

ルートに配置。`$schema` のバージョンはインストールした Biome と一致させる（`bunx biome --version` で確認）。

```json
{
  "$schema": "https://biomejs.dev/schemas/<version>/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "html": {
    "experimentalFullSupportEnabled": true,
    "formatter": {
      "enabled": true,
      "indentStyle": "space"
    }
  },
  "css": {
    "parser": {
      "tailwindDirectives": true
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

| 設定                                    | モノレポ（Astro LP）  | Vite 単体                          |
| --------------------------------------- | --------------------- | ---------------------------------- |
| `html.experimentalFullSupportEnabled`   | `.astro` の HTML 整形 | ルート `index.html` の整形         |
| `css.parser.tailwindDirectives`         | `@tailwind` 等        | `src/*.css` で Tailwind を使う場合 |
| `assist.actions.source.organizeImports` | 共通                  | `src/**/*.tsx` の import 整理      |

Vite で Tailwind を使わない場合も、`css.parser.tailwindDirectives` は残して問題ない。

本リポジトリ（Vite 単体）の正本: ルート [`biome.json`](../../../biome.json)

### 3. ルート `package.json` にスクリプト追加

ルートからリポジトリ全体（または単体なら `.`）を対象にする:

```json
{
  "scripts": {
    "check": "biome check .",
    "check:fix": "biome check . --write",
    "lint": "biome check .",
    "lint:fix": "biome check . --write",
    "format": "biome format .",
    "format:fix": "biome format . --write"
  }
}
```

| スクリプト              | 用途                                |
| ----------------------- | ----------------------------------- |
| `check` / `check:fix`   | Lint + Format + import 整理（推奨） |
| `lint` / `lint:fix`     | `check` のエイリアス                |
| `format` / `format:fix` | 整形のみ                            |

`build` / `dev` は Vite のまま（`"dev": "vite"` 等）。Biome はビルド前の品質チェックとして `check` を CI に載せる。

### 4. ESLint からの移行（Vite テンプレートでよくある）

`create vite` 系は `eslint` と `eslint.config.js` が入っている。**Biome 導入時は ESLint を外し一本化する。**

1. `eslint.config.js` を削除
2. 不要な devDependencies を削除:

```bash
bun remove eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript-eslint
```

3. `package.json` の `"lint": "eslint ."` を上記 Biome スクリプトに差し替え（手順 3）

Prettier 単体を使っている場合も同様に Biome に統合する。

### 5. 初回整形

```bash
bun run check:fix
```

**モノレポ**の対象例: `apps/*/package.json`、`*.astro`、`*.mjs`、`*.json`、`*.jsonc`、`*.ts`、`*.d.ts`

**Vite 単体**の対象例:

| パス                                | 内容                        |
| ----------------------------------- | --------------------------- |
| `index.html`                        | エントリ HTML               |
| `src/**/*.{ts,tsx,css}`             | React アプリ本体            |
| `vite.config.ts`                    | Vite 設定                   |
| `worker/index.ts`                   | Cloudflare Worker（利用時） |
| `tsconfig*.json` / `wrangler.jsonc` | 設定 JSON                   |

`.gitignore` の `dist` / `node_modules` は VCS 連携で Biome がスキップする。

#### Vite + React で初回 `check:fix` 後に直しがちな点

Biome `recommended` でテンプレ由来コードが指摘されることがある。代表例:

| ルール                             | 典型箇所                                    | 対応                              |
| ---------------------------------- | ------------------------------------------- | --------------------------------- |
| `lint/style/noNonNullAssertion`    | `src/main.tsx` の `getElementById("root")!` | null チェック後に `createRoot`    |
| `lint/a11y/useButtonType`          | `src/App.tsx` の `<button>`                 | `type="button"` を付与            |
| `lint/suspicious/noEmptyInterface` | 空の `__BaseEnv_Env`                        | 下記 Wrangler 節の `biome-ignore` |

```typescript
// src/main.tsx（例）
const root = document.getElementById("root");
if (!root) {
  throw new Error('Root element "#root" not found');
}
createRoot(root).render(/* ... */);
```

### 6. Cloudflare / Wrangler（任意）

`wrangler types` / `cf-typegen` が生成する `worker-configuration.d.ts` はランタイム型が大量に含まれる。Biome 整形後、**Env バインディング定義のみ**残す:

```typescript
/* eslint-disable */
// Generated by Wrangler by running `wrangler types`
// Re-run `wrangler types` then restore this minimal Env block if the file grows again.
// biome-ignore lint/suspicious/noEmptyInterface: placeholder until Wrangler bindings are added
interface __BaseEnv_Env {}

declare namespace Cloudflare {
  interface GlobalProps {
    mainModule: typeof import("./worker/index");
  }
  interface Env extends __BaseEnv_Env {}
}

interface Env extends __BaseEnv_Env {}
```

- **Vite 単体 + `@cloudflare/vite-plugin`**: ルートの [`worker-configuration.d.ts`](../../../worker-configuration.d.ts)
- **モノレポ LP**: `apps/lp/worker-configuration.d.ts` 等、各アプリ直下

`ASSETS` 等のバインディングは `wrangler.jsonc` に合わせて `__BaseEnv_Env` に追記する。再生成で肥大化したら同様に整理する。

Biome 2.x では `files.ignore` は使えない。除外が必要なら [`files.includes` の force-ignore](https://biomejs.dev/reference/configuration/#filesincludes) を使うか、上記のとおり生成物を最小化する。

### 7. 確認

```bash
bun run check
```

エラー 0 であること。CI では `check`（`--write` なし）を使う。Vite ビルドとは別ジョブでよい。

```bash
bun run build   # 型チェック + Vite ビルド（既存スクリプトがある場合）
```

## 完了チェックリスト

**共通**

```
- [ ] `bun add -D -E @biomejs/biome` 済み（モノレポはルートのみ）
- [ ] ルート `biome.json` 作成（schema バージョン一致）
- [ ] ルート `package.json` に check / lint / format スクリプト追加
- [ ] `bun run check:fix` で初回整形
- [ ] `bun run check` が通る
```

**Vite 単体の追加**

```
- [ ] `eslint.config.js` 削除、ESLint 系 devDependencies を `bun remove`
- [ ] `index.html` / `src/**` / `vite.config.ts` が check 対象になっている
- [ ] React テンプレの typical lint（button type、root null チェック）を解消
- [ ] Wrangler 利用時は `worker-configuration.d.ts` を最小 Env 定義に整理
```

**モノレポの追加**

```
- [ ] workspace パッケージに `@biomejs/biome` を重複追加していない
- [ ] `apps/*` 配下が `bun run check` でカバーされている
```

## やらないこと

- `npm` / `pnpm` / `yarn` / `npx` で Biome を入れない（Bun のみ）
- 各 workspace パッケージに `@biomejs/biome` を重複追加しない（ルート devDependency のみ）
- ESLint + Prettier と Biome を同一プロジェクトに併用しない（移行時は Biome に一本化）
- Vite の `dev` / `build` を Biome に置き換えない（役割が異なる）

## 参照

- [Biome 公式](https://biomejs.dev/)
- [Biome — files.includes（force-ignore）](https://biomejs.dev/reference/configuration/#filesincludes)
- [Vite](https://vite.dev/)
