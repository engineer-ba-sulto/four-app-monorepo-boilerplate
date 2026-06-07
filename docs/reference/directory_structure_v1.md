# Directory Structure v1

- Date: 2026-06-06
- Status: Final
- Related spec: `monorepo_boilerplate_spec_v1.md`
- App scaffolding: `app_scaffolding_v1.md`
- Boilerplate name: `four-app-monorepo-boilerplate`
- Intended implementation directory: `DemoProject/four-app-monorepo-boilerplate/`

```txt
DemoProject/four-app-monorepo-boilerplate/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── wrangler.jsonc
│   ├── web/
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── router.tsx
│   │   │   └── routes/
│   │   │       ├── __root.tsx
│   │   │       └── index.tsx
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── wrangler.jsonc
│   ├── sp/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── _layout.tsx
│   │   │   │   └── index.tsx
│   │   │   ├── components/
│   │   │   │   └── status-card.tsx
│   │   │   └── lib/
│   │   │       └── api.ts
│   │   ├── app.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── lp/
│       ├── src/
│       │   ├── pages/
│       │   │   └── index.astro
│       │   ├── layouts/
│       │   │   └── base-layout.astro
│       │   ├── components/
│       │   │   ├── hero.astro
│       │   │   └── cta.astro
│       │   └── styles/
│       │       └── global.css
│       ├── astro.config.mjs
│       ├── package.json
│       ├── tsconfig.json
│       └── wrangler.jsonc
├── packages/
│   ├── schema/
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   ├── echo.ts
│   │   │   │   └── status.ts
│   │   │   ├── common/
│   │   │   │   └── app-env.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── api-client/
│   │   ├── src/
│   │   │   ├── helpers/
│   │   │   │   ├── echo.ts
│   │   │   │   └── status.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── env/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── config/
│   │   ├── tsconfig/
│   │   │   ├── base.json
│   │   │   ├── react.json
│   │   │   ├── worker.json
│   │   │   └── node.json
│   │   ├── cloudflare/
│   │   │   └── README.md
│   │   └── package.json
│   ├── utils/
│   │   ├── src/
│   │   │   ├── cn.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── ui/
│       ├── src/
│       │   ├── button.tsx
│       │   ├── link-button.tsx
│       │   ├── card.tsx
│       │   ├── badge.tsx
│       │   ├── status-indicator.tsx
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── docs/
│   ├── architecture.md
│   ├── env.md
│   ├── development.md
│   ├── deployment.md
│   └── recipes/
│       ├── database.md
│       ├── auth.md
│       ├── cloudflare-access.md
│       └── openapi.md
├── README.md
├── package.json
├── bun.lock
├── biome.json
└── tsconfig.base.json
```

## Deferred Recipe Backlog

```txt
docs/recipes/
├── storage-r2.md
├── email.md
├── database-d1.md
├── kv.md
└── queues.md
```

## Notes

- `api / web / lp` each have their own `wrangler.jsonc`.
- Worker names use `<project-name>-api`, `<project-name>-web`, and `<project-name>-lp` placeholders.
- `apps/sp` uses `src/app/` for Expo Router files.
- Shared packages use `@repo/*` package names.
