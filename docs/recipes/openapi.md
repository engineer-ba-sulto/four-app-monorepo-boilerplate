# Recipe: OpenAPI

OpenAPI spec の生成と公開。初期 core には Hono RPC のみで、OpenAPI は含めない。

## When to use

- 外部パートナー向け REST ドキュメント
- SDK 自動生成（OpenAPI Generator 等）
- API ゲートウェイ / Postman 連携
- Hono RPC 以外のクライアント（非 TypeScript）向け

Hono RPC + `@repo/api-client` で十分な場合は OpenAPI は不要。

## Recommended approach

| Tool                                                                                     | Fit                            |
| ---------------------------------------------------------------------------------------- | ------------------------------ |
| [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) | Zod + OpenAPI route 定義       |
| [hono-openapi](https://github.com/rhinobase/hono-openapi)                                | 既存 Hono route から spec 生成 |

`@repo/schema` の Zod schema を OpenAPI schema の source of truth にする。

## Procedure

### 1. Install dependencies

```bash
cd apps/api
bun add @hono/zod-openapi @hono/swagger-ui
```

### 2. Define OpenAPI route (example)

```typescript
// apps/api/src/routes/status.openapi.ts
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { statusResponseSchema } from "@repo/schema";

const statusRoute = createRoute({
  method: "get",
  path: "/status",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: statusResponseSchema,
        },
      },
      description: "API status",
    },
  },
});

export function registerStatusOpenApi(app: OpenAPIHono) {
  app.openapi(statusRoute, (c) => {
    return c.json({
      status: "ok",
      app: "api",
      version: "0.0.0",
      env: "development",
      timestamp: new Date().toISOString(),
    });
  });
}
```

### 3. Serve spec and Swagger UI

```typescript
// apps/api/src/openapi-app.ts
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

const openApiApp = new OpenAPIHono();

// Register routes...
// registerStatusOpenApi(openApiApp);

openApiApp.doc("/doc", {
  openapi: "3.0.0",
  info: { title: "My App API", version: "1.0.0" },
});

openApiApp.get("/ui", swaggerUI({ url: "/doc" }));

export { openApiApp };
```

既存 `app.ts` とマージするか、`/openapi/*` 配下に mount。

### 4. Keep @repo/schema in sync

```typescript
// packages/schema/src/api/status.ts — already used by Hono routes
export const statusResponseSchema = z.object({
  status: z.literal("ok"),
  app: z.string(),
  version: z.string(),
  env: appEnvSchema,
  timestamp: z.string().datetime(),
});
```

OpenAPI route 定義でも同じ schema を import し、二重定義を避ける。

### 5. Generate static spec (CI optional)

```typescript
// scripts/generate-openapi.ts
import { openApiApp } from "../apps/api/src/openapi-app";

const spec = openApiApp.getOpenAPIDocument({
  openapi: "3.0.0",
  info: { title: "My App API", version: "1.0.0" },
});

await Bun.write("docs/openapi.json", JSON.stringify(spec, null, 2));
```

```bash
bun run scripts/generate-openapi.ts
```

### 6. Client generation (optional)

```bash
npx @openapitools/openapi-generator-cli generate \
  -i docs/openapi.json \
  -g typescript-fetch \
  -o packages/openapi-client
```

TypeScript 内部では引き続き `@repo/api-client`（Hono RPC）を推奨。

## Env / deploy

- `/doc` と `/ui` は staging のみ公開、または Access 保護（[cloudflare-access.md](./cloudflare-access.md)）
- 本番で public にする場合は rate limit を検討

## Checklist

- [ ] `@hono/zod-openapi` 導入
- [ ] 既存 route（`/health`, `/status`, `/echo`）を OpenAPI 化
- [ ] `@repo/schema` と schema 共有
- [ ] `docs/openapi.json` 生成 script（任意）
- [ ] Swagger UI の公開範囲を決定

## Related

- [@repo/api-client](../../packages/api-client) — Hono RPC（TypeScript 向け）
- [auth.md](./auth.md) — protected routes の OpenAPI security scheme
