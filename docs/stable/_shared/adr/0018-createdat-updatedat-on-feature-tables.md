---
created: 2026-05-18
updated: 2026-05-18
summary: Every app-owned feature table carries `createdAt` and `updatedAt` timestamp columns (NOT NULL, defaulting to `now()`), with `updatedAt` auto-bumped via Drizzle's `$onUpdate`. Currently missing on `projects.updatedAt`, `labels.*`, `reminders.*` — added with a `now()` backfill. Auth tables (BetterAuth-managed) are exempt.
status: accepted
---

# `createdAt` + `updatedAt` on every app feature table

Every app-owned feature table — `tasks`, `projects`, `labels`, `reminders`, `users_projects`, and any future feature table — carries two timestamp columns: `createdAt` (set once on insert, NOT NULL, default `now()`) and `updatedAt` (set on insert AND auto-bumped on every UPDATE via Drizzle's `$onUpdate(() => new Date())`, NOT NULL, default `now()`). Currently `tasks` and `users_projects` have both; `projects` has only `createdAt`; `labels` and `reminders` have neither. The migration adds the missing columns with a `now()` backfill — historical accuracy is unrecoverable so all pre-existing rows land at the migration time.

The convention is **uniform**: a future reader checking any feature table can rely on these two columns. Future feature tables get them by default; deviations require explicit ADR justification (none anticipated). Auth tables (`users`, `sessions`, `accounts`, `verifications`) are BetterAuth-managed and exempt — their timestamp shape follows BetterAuth's contract.

Rationale: cheap (~16 bytes / row), free audit info, enables list-sort-by-recent + sync APIs + activity-log feature (v2) without retrofitting, matches industry convention (Rails / Django / Prisma auto-add). Per-table reasoning was rejected — uniformity beats case-by-case deliberation.

See [Backend coding-practices](../../../llm/coding-practices.md#backend-hono--drizzle--zod) for the rule applied to all new feature tables. See also [ADR-0002 (soft-delete)](./0002-soft-delete-via-deletedat.md) which adds a third standard column (`deletedAt`, nullable) to the same set of feature tables.
