# Recipe: Cloudflare Access

Cloudflare Access（Zero Trust）で api / web / lp を保護する手順。初期 core には含めない。

## When to use

- 社内ツール・staging 環境を ID プロバイダ（Google, GitHub, Okta など）で保護
- VPN なしで Zero Trust アクセス
- 管理画面や preview 環境のゲート

アプリ内ユーザー認証（サインアップ / ログイン UI）には [auth.md](./auth.md) を使う。Access は **インフラ層** の保護。

## Prerequisites

- Cloudflare Zero Trust プラン
- 各 Worker に custom domain または `*.workers.dev` route
- Identity provider 設定（Google Workspace 等）

## Procedure

### 1. Create Access application

Cloudflare Zero Trust dashboard:

1. **Access** → **Applications** → **Add an application**
2. Type: **Self-hosted**
3. Application domain: `api.example.com`（api Worker）
4. Identity providers を選択
5. Policy: Allow specific emails / groups

web / lp も同様に別 Application として作成可能。

### 2. Protect staging only (recommended pattern)

```txt
api.example.com          → public（本番 API）
staging-api.example.com  → Access protected
staging-app.example.com  → Access protected
```

本番と staging で Worker / route を分ける。

### 3. Validate JWT in API (optional)

Access は `Cf-Access-Jwt-Assertion` ヘッダーを付与。API で検証する場合:

```typescript
// apps/api/src/middleware/access.ts
import { createMiddleware } from "hono/factory";

export const verifyAccessJwt = createMiddleware(async (c, next) => {
  const jwt = c.req.header("Cf-Access-Jwt-Assertion");
  if (!jwt) return c.json({ error: "Forbidden" }, 403);

  // Verify against Cloudflare Access certs
  // https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/
  await next();
});
```

多くの場合、Access が Worker 手前で弾くため API 側検証は不要。Service-to-service や mobile SP から直接 API を叩く場合は [auth.md](./auth.md) の JWT 方式を併用。

### 4. SP / mobile considerations

Cloudflare Access はブラウザ SSO 向け。`apps/sp` から API を直接呼ぶ場合:

- Access で API を保護すると mobile client がブロックされる
- SP 向け API は public + [auth.md](./auth.md) の Bearer token
- または Access Service Auth（mTLS / service token）— 高度

### 5. Wrangler / env

Access 自体は dashboard 設定。Worker 側の変更は最小。

```jsonc
// apps/api/wrangler.jsonc — staging environment example
{
  "env": {
    "staging": {
      "name": "<project-name>-api-staging",
      "routes": [
        { "pattern": "staging-api.example.com", "zone_name": "example.com" },
      ],
    },
  },
}
```

## Checklist

- [ ] Zero Trust Application 作成（api / web / lp 対象を決定）
- [ ] Identity provider 連携
- [ ] staging / production の route 分離
- [ ] SP が Access 保護 API を呼ばない設計を確認
- [ ] [deployment.md](../deployment.md) に staging URL を追記

## Related

- [auth.md](./auth.md) — アプリ内認証
- [deployment.md](../deployment.md) — Worker デプロイ
- [Cloudflare Access docs](https://developers.cloudflare.com/cloudflare-one/policies/access/)
