# Recipe: Database

DB / ORM を monorepo に追加する手順。初期 core には含めない。

## When to use

- 永続化が必要になったとき（ユーザー、コンテンツ、トランザクションなど）
- Cloudflare D1 を使う場合は [database-d1.md](./database-d1.md)（backlog）も参照

## Recommended approach

| Layer               | Location                               | Notes                           |
| ------------------- | -------------------------------------- | ------------------------------- |
| Schema / migrations | `packages/db`（新規）または `apps/api` | ORM に依存                      |
| Queries             | `apps/api` の route handlers           | Hono middleware で DB を inject |
| Client types        | `@repo/schema`                         | API response 用 Zod schema      |

ORM 候補: Drizzle（D1 / Postgres 両対応）、Prisma（Postgres 向け）。

## Procedure

### 1. Create packages/db (example: Drizzle)

```bash
mkdir -p packages/db/src
```

```json
// packages/db/package.json
{
  "name": "@repo/db",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "drizzle-orm": "^0.38.0"
  }
}
```

```typescript
// packages/db/src/schema/users.ts
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
});
```

```typescript
// packages/db/src/index.ts
export * from "./schema/users";
```

### 2. Bind D1 in apps/api (Cloudflare)

```jsonc
// apps/api/wrangler.jsonc — add binding
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "<project-name>-db",
      "database_id": "<uuid>",
    },
  ],
}
```

```typescript
// apps/api/src/lib/db.ts
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@repo/db";

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
```

### 3. Use in Hono route

```typescript
// apps/api/src/app.ts
import { createDb } from "./lib/db";
import { users } from "@repo/db";

app.get("/users/:id", async (c) => {
  const db = createDb(c.env.DB);
  const row = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, c.req.param("id")),
  });
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
```

### 4. Migrations

D1 の場合:

```bash
cd apps/api
wrangler d1 migrations create <database-name> init
wrangler d1 migrations apply <database-name> --local
wrangler d1 migrations apply <database-name> --remote
```

Postgres の場合は Drizzle Kit または Prisma migrate を CI で実行。

### 5. Tests

```typescript
// apps/api/src/app.test.ts — mock D1 or use local D1
import { env, createExecutionContext } from "cloudflare:test";
```

Bun test + `cloudflare:test` で Worker 統合テストを追加。

## Env additions

| Variable       | Where            | Secret                   |
| -------------- | ---------------- | ------------------------ |
| `DATABASE_URL` | Postgres 外部 DB | Yes                      |
| D1 binding     | `wrangler.jsonc` | No（binding name: `DB`） |

`@repo/env` に DB 関連は **server-only** として追加。`PUBLIC_*` に DB URL を入れない。

## Checklist

- [ ] `@repo/db` または api 内 schema 作成
- [ ] `wrangler.jsonc` binding / `DATABASE_URL` secret
- [ ] migration 実行手順を README に追記
- [ ] `@repo/schema` に API response schema 追加
- [ ] Bun test で CRUD の smoke test

## Related backlog

- [database-d1.md](./database-d1.md) — D1 専用の詳細手順（未作成）
