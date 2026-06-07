# Environment variables

共通 env の定義と、app ごとの読み取り方法。

## Common variables

`@repo/env` の `commonEnvSchema` で検証する。

| Variable               | Type                                       | Example                   | Description                     |
| ---------------------- | ------------------------------------------ | ------------------------- | ------------------------------- |
| `APP_ENV`              | `development` \| `staging` \| `production` | `development`             | 実行環境                        |
| `PUBLIC_SITE_URL`      | URL                                        | `https://example.com`     | 公開サイト URL（LP または web） |
| `PUBLIC_APP_URL`       | URL                                        | `https://app.example.com` | Web app URL                     |
| `PUBLIC_API_URL`       | URL                                        | `https://api.example.com` | API base URL                    |
| `PUBLIC_APP_NAME`      | string                                     | `My App`                  | アプリ表示名                    |
| `PUBLIC_SUPPORT_EMAIL` | email                                      | `support@example.com`     | サポート連絡先                  |

デフォルト値は `packages/env/src/index.ts` の `commonEnvDefaults` を参照。

## Per-app loading

### apps/api (Cloudflare Workers)

- **Production / preview:** `apps/api/wrangler.jsonc` の `vars`
- **Secrets:** `wrangler secret put <NAME>` または Cloudflare dashboard
- **Local dev:** `apps/api/.dev.vars`（gitignore 対象）

```typescript
// apps/api/src/app.ts
const env = parseCommonEnv({
  APP_ENV: bindings.APP_ENV ?? commonEnvDefaults.APP_ENV,
  // ...
});
```

### apps/web (Vite + Workers)

- **Vite dev:** `apps/web/.env` に `PUBLIC_*`（Vite は `import.meta.env.PUBLIC_*` で公開）
- **Workers:** `apps/web/wrangler.jsonc` の `vars` / `.dev.vars`

```env
# apps/web/.env.example（コピーして .env を作成）
PUBLIC_API_URL=http://localhost:8787
PUBLIC_APP_URL=http://localhost:5173
PUBLIC_SITE_URL=https://example.com
PUBLIC_APP_NAME=My App
PUBLIC_SUPPORT_EMAIL=support@example.com
APP_ENV=development
```

```typescript
// apps/web/src/lib/env.ts
import.meta.env.PUBLIC_API_URL ?? commonEnvDefaults.PUBLIC_API_URL;
```

### apps/lp (Astro + Workers)

web と同様。Astro では `import.meta.env.PUBLIC_*` を使う。

```env
# apps/lp/.env
PUBLIC_APP_URL=http://localhost:5173
PUBLIC_API_URL=http://localhost:8787
```

### apps/sp (Expo)

Expo は **`EXPO_PUBLIC_*`** プレフィックスが必要。`@repo/env` のキー名にマッピングする。

| Common key             | Expo env var                |
| ---------------------- | --------------------------- |
| `APP_ENV`              | `EXPO_PUBLIC_APP_ENV`       |
| `PUBLIC_SITE_URL`      | `EXPO_PUBLIC_SITE_URL`      |
| `PUBLIC_APP_URL`       | `EXPO_PUBLIC_APP_URL`       |
| `PUBLIC_API_URL`       | `EXPO_PUBLIC_API_URL`       |
| `PUBLIC_APP_NAME`      | `EXPO_PUBLIC_APP_NAME`      |
| `PUBLIC_SUPPORT_EMAIL` | `EXPO_PUBLIC_SUPPORT_EMAIL` |

```env
# apps/sp/.env
EXPO_PUBLIC_API_URL=http://localhost:8787
EXPO_PUBLIC_APP_NAME=My App
```

```typescript
// apps/sp/src/lib/env.ts
process.env.EXPO_PUBLIC_API_URL ?? commonEnvDefaults.PUBLIC_API_URL;
```

`.env` 変更後は Metro bundler の再起動が必要な場合がある。

## Local development defaults

| Service        | Default URL                          |
| -------------- | ------------------------------------ |
| API (Wrangler) | `http://localhost:8787`              |
| Web (Vite)     | `http://localhost:5173`              |
| LP (Astro)     | `http://localhost:4321`              |
| SP (Expo)      | Metro bundler（実機 / シミュレータ） |

`wrangler.jsonc` の dev 用 `PUBLIC_API_URL` は `http://localhost:8787` に設定済み。

## Security

- `.env`, `.dev.vars`, secrets を **コミットしない**
- 本番 secrets は `wrangler secret put` または CI/CD の secret store を使う
- `PUBLIC_*` / `EXPO_PUBLIC_*` はクライアントに露出する前提。機密情報を入れない

## Adding app-specific env

1. app 固有 schema を `apps/<app>/src/lib/env.ts` または `@repo/env` に追加
2. 共通 env と混在させない（共通は `@repo/env`、固有は app 内）
3. このドキュメントと README の env 表を更新

## Related

- [architecture.md](./architecture.md)
- [development.md](./development.md)
- [deployment.md](./deployment.md)
