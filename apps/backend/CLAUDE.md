---
created: 2026-05-13
updated: 2026-05-13
summary: Backend workspace guide — Hono + Drizzle + BetterAuth REST API consumed by every frontend in this monorepo via Hono RPC.
---

# apps/backend

Shared REST API for the monorepo. Every frontend in `apps/` consumes this backend via the Hono RPC client exported from this package. Treated as **stable**: expand only when a frontend genuinely needs new endpoints.

## Stack

- Bun runtime.
- Hono + `@hono/zod-openapi` for routes; `@scalar/hono-api-reference` for the generated API docs UI.
- Drizzle ORM 0.45 against PostgreSQL (`postgres` driver). Schemas discovered from `src/features/**/*.db.ts`.
- BetterAuth (email + password), mounted at `/auth/*`.
- Zod 4 (+ `drizzle-zod`) for runtime + OpenAPI schemas.

See [`docs/stable/backend/architecture.md`](../../docs/stable/backend/architecture.md) for the full per-feature file layout and [`docs/stable/backend/error-handling.md`](../../docs/stable/backend/error-handling.md) for the error model.

## Layer pattern

Three layers per feature under `src/features/<resource>/`:

- `.router.ts` instantiates layers (repository → service → controller) and binds routes.
- `.routes.ts` declares route shapes with Zod schemas.
- `.controller.ts` parses input, calls one service, formats output.
- `.service.ts` business logic, throws domain errors.
- `.repository.ts` DB access + schema validation.
- `.db.ts` Drizzle tables + drizzle-zod schemas.
- `.types.ts` extra API schemas + request/response types.

Full explanation: [`docs/stable/backend/architecture.md`](../../docs/stable/backend/architecture.md).

## Scripts of note

(Defined in this workspace's `package.json`.)

- `dev` — runs the dev server.
- `bun:dev` — `bun run --hot src/index.ts`.
- `db:dev` — `docker compose` for the local PostgreSQL.
- `db:generateMigration` — `drizzle-kit generate`.
- `db:migrate` — applies migrations.
- `db:seed` — seeds the database.
- `build` — `tsc --project tsconfig.build.json`.

## Auth

- BetterAuth handles `/auth/*` (sign-up, sign-in, sessions, password rules).
- Sessions are HTTP-only cookies; frontends must include credentials.
- Trusted origins are configured in `src/utils/auth.ts` (production origin + the dev frontend port).
- Middlewares: `addAuthMiddleware` (decorates context with optional user/session), `checkAuthMiddleware` (enforces auth on protected routes).

## Zod schemas + responses

- Schemas live next to their feature in `.db.ts` / `.types.ts`. `@hono/zod-openapi` requires schemas to be OpenAPI-extended — see [`docs/stable/backend/zod-schemas.md`](../../docs/stable/backend/zod-schemas.md) (⚠ flagged outdated; verify against current code).
- Response-shape edge case: empty `data` payloads use `z.never().openapi({ type: 'null' })` — see [`docs/stable/backend/responses.md`](../../docs/stable/backend/responses.md).

## Logger

Custom `getServerLogger()` in `src/utils/logger.ts`. Use `logger.debug/info/warn/error`. `logRequestsMiddleware` is applied globally and logs `[METHOD] /path?query`.

## TypeScript path alias

`*/ → ./src/*` — `import { x } from 'utils/logger'` resolves to `src/utils/logger.ts`.

## Unused-but-kept code

This workspace was originally scaffolded with full CRUD across all features (tasks/projects/labels/reminders), but only some endpoints are actively consumed by `react19`. **Keep the scaffolding** — improve a feature when a frontend actually needs it, don't preemptively delete. Treat unused code as "ready to be specced", not as dead weight.

## Tests

None currently. When adding: prefer integration tests against a real Postgres (not mocked). Decision not locked in yet.
