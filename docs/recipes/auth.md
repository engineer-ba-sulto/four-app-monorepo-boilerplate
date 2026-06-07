# Recipe: Auth

認証を api / web / sp に追加する手順。初期 core には含めない。

## When to use

- ユーザー登録・ログインが必要
- API の保護 route が必要
- Web / SP でセッションまたは JWT を扱う

## Recommended approach

| Component | Suggestion                                                   |
| --------- | ------------------------------------------------------------ |
| API       | Hono middleware + session/JWT 検証                           |
| Web       | Cookie session または Bearer token（TanStack Router loader） |
| SP        | Secure storage（Expo SecureStore）+ refresh flow             |
| Provider  | 自前 DB、Clerk、Auth.js、Better Auth など                    |

OAuth / SSO だけなら Cloudflare Access も検討: [cloudflare-access.md](./cloudflare-access.md)。

## Procedure

### 1. Extend @repo/schema

```typescript
// packages/schema/src/api/auth.ts
import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const sessionSchema = z.object({
  userId: z.string(),
  expiresAt: z.string().datetime(),
});
```

### 2. Add auth routes to API

```typescript
// apps/api/src/routes/auth.ts
import { Hono } from "hono";
import { loginRequestSchema } from "@repo/schema";

export const authRoutes = new Hono();

authRoutes.post("/login", async (c) => {
  const body = loginRequestSchema.safeParse(await c.req.json());
  if (!body.success) return c.json({ error: "Invalid request" }, 400);

  // Verify credentials against DB
  // Issue session cookie or JWT
  return c.json({ ok: true });
});
```

```typescript
// apps/api/src/app.ts
import { authRoutes } from "./routes/auth";

app.route("/auth", authRoutes);
```

### 3. Auth middleware

```typescript
// apps/api/src/middleware/auth.ts
import { createMiddleware } from "hono/factory";

export const requireAuth = createMiddleware(async (c, next) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  // Verify token / session
  // c.set("userId", userId);
  await next();
});
```

```typescript
app.get("/me", requireAuth, (c) => {
  return c.json({ userId: c.get("userId") });
});
```

### 4. Web client

```typescript
// apps/web/src/lib/auth.ts
export async function login(email: string, password: string) {
  const res = await fetch(`${getWebEnv().PUBLIC_API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}
```

TanStack Router の `beforeLoad` で未認証ユーザーを redirect。

### 5. SP client

```typescript
// apps/sp/src/lib/auth.ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

`@repo/api-client` の fetch に headers を渡す wrapper を app 側で追加。

## Env additions

| Variable         | Where              | Secret |
| ---------------- | ------------------ | ------ |
| `AUTH_SECRET`    | api Worker         | Yes    |
| `JWT_SECRET`     | api Worker         | Yes    |
| OAuth client IDs | Provider dashboard | Mixed  |

クライアントに secret を渡さない。SP には refresh token のみ SecureStore に保存。

## Security checklist

- [ ] HTTPS のみ（本番）
- [ ] `httpOnly` cookie（web）または SecureStore（sp）
- [ ] Rate limiting on `/auth/login`
- [ ] Password hashing（argon2 / bcrypt）— 平文保存禁止
- [ ] CORS を `PUBLIC_APP_URL` に限定

## Checklist

- [ ] `@repo/schema` に auth schema
- [ ] API routes + middleware
- [ ] Web login flow + protected routes
- [ ] SP token storage + API headers
- [ ] [database.md](./database.md) で users テーブル

## Related

- [cloudflare-access.md](./cloudflare-access.md) — Zero Trust / SSO
- [database.md](./database.md) — ユーザーテーブル
