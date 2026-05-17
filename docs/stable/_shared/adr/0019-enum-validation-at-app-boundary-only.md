---
created: 2026-05-18
updated: 2026-05-18
summary: Column-level enum values (e.g. `tasks.status`, `tasks.priority`, `tasks.recurringInterval`) are validated only at the application boundary — Zod on the route schema + Drizzle's TypeScript types. No `CHECK` constraint or `pgEnum` at the database level. Revisit if external writers (analytics replicas, multi-service architecture, direct DBA migrations) gain DB access.
status: accepted
---

# Enum validation at the application boundary only

The backend's enum-like columns — `tasks.status` (`'todo' | 'in_progress' | 'done'`), `tasks.priority` (`'low' | 'medium' | 'high'`), `tasks.recurringInterval` (`'none' | 'daily' | 'weekly' | 'monthly'`) — are validated only at the **application boundary**: Zod schemas on the route (`@hono/zod-openapi`) reject invalid values with a 400, and Drizzle's typed insert/update APIs prevent passing wrong values at compile time. The DB columns are plain `text` with no `CHECK` constraint and no `pgEnum`. A future contributor seeing this should not treat it as an oversight.

Rejected:

- **`pgEnum`** — adding values requires `ALTER TYPE ... ADD VALUE` (DDL care, transaction limits in older Postgres); removing values requires drop+recreate; renaming requires migration. Too rigid during early development where enum churn is normal (e.g. dropping `tasks.isRecurring` per [ADR-0003](./0003-drop-tasks-isrecurring.md), potential future status changes).
- **`text` + `CHECK` constraint** — DB-level enforcement without the type rigidity, easier to evolve than `pgEnum`. Rejected for now because: this is a single-process backend (only the app writes to the DB), Drizzle's typed APIs + Zod at the boundary already cover the realistic write paths, and the marginal defense-in-depth doesn't justify migration friction at this scale.

**Revisit when**: external writers gain DB access — analytics read-replicas that some other service writes to, multi-service architectures where another team can issue arbitrary SQL, or scheduled jobs that bypass the app. At that point add `CHECK` constraints (not `pgEnum`) for the easier evolution path.

Documented in [Backend coding-practices](../../../llm/coding-practices.md#backend-hono--drizzle--zod).
