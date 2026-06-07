# Deployment

Cloudflare Workers（api / web / lp）と Expo（sp）のデプロイ概要。

## Overview

| App | Target             | Command                       |
| --- | ------------------ | ----------------------------- |
| api | Cloudflare Workers | `bun run --filter api deploy` |
| web | Cloudflare Workers | `bun run --filter web deploy` |
| lp  | Cloudflare Workers | `bun run --filter lp deploy`  |
| sp  | EAS / app stores   | Expo / EAS CLI（下記参照）    |

各 Worker は独立。Worker 名の placeholder:

```txt
<project-name>-api   # 現在: four-app-monorepo-boilerplate-api
<project-name>-web   # 現在: four-app-monorepo-boilerplate-web
<project-name>-lp    # 現在: four-app-monorepo-boilerplate-lp
```

プロジェクト名変更時は各 `wrangler.jsonc` の `name` を更新する。

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/) と Wrangler ログイン（`wrangler login`）
- 本番用 env / secrets の準備（[env.md](./env.md)）
- SP: [Expo account](https://expo.dev/) と EAS（必要に応じて）

## Cloudflare Workers

### api

```bash
bun run --filter api deploy
```

- Entry: `apps/api/src/index.ts`
- Config: `apps/api/wrangler.jsonc`
- 本番 env: `vars` + `wrangler secret put`

### web

```bash
bun run --filter web deploy
```

ビルド（Vite）後に Wrangler で SPA assets を Worker にデプロイする。

- Config: `apps/web/wrangler.jsonc`
- `assets.not_found_handling`: `single-page-application`

### lp

```bash
bun run --filter lp deploy
```

Astro build（`dist/`）を `@astrojs/cloudflare` adapter 経由でデプロイ。

- Config: `apps/lp/wrangler.jsonc`
- `assets.directory`: `./dist`

### Production env

1. `wrangler.jsonc` の `vars` に非機密の `PUBLIC_*` を設定
2. 機密値は `wrangler secret put SECRET_NAME`
3. 環境別デプロイは Wrangler [environments](https://developers.cloudflare.com/workers/wrangler/environments/) を検討

```bash
cd apps/api
wrangler secret put DATABASE_URL   # 例: DB 追加後
```

### Custom domains

Cloudflare dashboard で各 Worker に route / custom domain を割り当てる。`PUBLIC_*` URL を本番ドメインに合わせて更新する。

## Expo (apps/sp)

SP は Cloudflare Workers にはデプロイしない。

### Typical flow

1. `app.json` / EAS 設定をプロジェクト用に更新
2. EAS Build で iOS / Android バイナリを生成
3. App Store / Google Play に提出

```bash
# Bun 日常運用
bun run --filter sp build   # tsc --noEmit（型チェック）

# EAS / prebuild で Bun 不具合時は Expo 公式に従い npx を使用
npx eas build --platform all
npx eas submit
```

詳細は [Expo EAS ドキュメント](https://docs.expo.dev/eas/)。

### SP env in production

EAS の `eas.json` または EAS Secrets で `EXPO_PUBLIC_*` を設定する。クライアント露出前提の値のみ。

## Post-deploy checks

- [ ] `GET <PUBLIC_API_URL>/health` → `{ "ok": true }`
- [ ] Web app が `/status` を表示
- [ ] LP の CTA が `PUBLIC_APP_URL` を指す
- [ ] SP が API status を表示（実機テスト）

## Not in initial core

以下は recipes / backlog で追加:

- CI/CD パイプライン
- D1 / R2 / KV bindings の本番設定
- Cloudflare Access（[recipes/cloudflare-access.md](./recipes/cloudflare-access.md)）

## Related

- [packages/config/cloudflare/README.md](../packages/config/cloudflare/README.md)
- [env.md](./env.md)
- [architecture.md](./architecture.md)
