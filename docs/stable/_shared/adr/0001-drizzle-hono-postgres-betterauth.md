---
created: 2026-05-14
updated: 2026-05-14
summary: Backend stack locked in v1 — Hono framework, Drizzle ORM, PostgreSQL, BetterAuth for auth, Zod via @hono/zod-openapi.
status: accepted
---

# Backend stack — Hono + Drizzle + PostgreSQL + BetterAuth

The backend uses **Hono** (router + middleware), **Drizzle** (ORM + migrations), **PostgreSQL** (database via the `postgres` driver), **BetterAuth** (authentication, mounted at `/auth/*`), and **Zod 4** (validation + OpenAPI via `@hono/zod-openapi`) running on **Bun**. Picked for typesafety end-to-end (Hono RPC client gives the frontend typed routes), the small surface of each library, and Drizzle's first-class TypeScript schema definitions. Alternatives considered: Express/Fastify + Prisma + Auth.js — rejected because we wanted Hono's RPC client + Drizzle's schema ergonomics + BetterAuth's lighter-weight session model.

See [`docs/stable/backend/architecture.md`](../../backend/architecture.md) and the per-feature `src/features/*/*.db.ts` schemas for the in-code shape.
