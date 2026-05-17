---
created: 2026-05-17
updated: 2026-05-17
summary: Repository hydrated-read interface is the pair `findX` (bare) + `findXHydrated` (all natural relations of the entity); implementation uses Drizzle's relational query API via v1 `relations()` syntax. Manual `leftJoin` is reserved for "filter by related" queries.
status: accepted
---

# Hydrated-read interface (bare + hydrated) backed by Drizzle relational queries

A repository's hydrated-read surface is a **pair of methods**: `findX` returns the entity bare, `findXHydrated` returns the entity with all entities considered part of its natural representation (e.g. tasks-with-labels-and-reminders). Middle-ground variants (`findXWithLabelsOnly`) are added on demand only — not designed up front (YAGNI). The implementation uses Drizzle's relational query API (`db.query.X.findFirst({ with: ... })`) backed by `relations()` declarations per `.db.ts` file. `db.select().leftJoin()` is reserved for the narrower case where the root entity must be filtered by a related entity's value (Drizzle's relational API can't express that).

**Note · code examples below intentionally include snippets**, which is a deliberate deviation from the [no-code-snippets coding-practices rule](../../../llm/coding-practices.md). For an ADR this central to the backend's daily ergonomics, the comparison IS the decision — a prose-only ADR can't carry the trade-off. Snippets will rot; the **rule** is the canonical part. If snippets and the surrounding prose disagree in the future, the prose wins.

## Chosen interface — bare + hydrated pair

```ts
// per-feature *.repository.ts
async findById(taskId: string, userId: string): Promise<Task | null> {
  return db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.userId, userId)),
  });
}

async findByIdHydrated(taskId: string, userId: string): Promise<HydratedTask | null> {
  const result = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.userId, userId)),
    with: {
      labels:    { with: { label: true } },   // hop through junction
      reminders: true,
    },
  });
  if (!result) return null;
  return {
    ...result,
    labels: result.labels.map(tl => tl.label),  // flatten M2M
  };
}
```

`HydratedTask` is `Task & { labels: Label[]; reminders: Reminder[] }`. Drizzle infers the bare type natively; the hydrated mapping is one named type.

## Chosen implementation — Drizzle relational queries via v1 `relations()`

Per `.db.ts` file, declare a `relations()` block alongside the table:

```ts
// tasks.db.ts
import { relations } from 'drizzle-orm';

export const tasks = pgTable('tasks', { ... });

export const tasksRelations = relations(tasks, ({ many }) => ({
  labels:    many(taskLabels),
  reminders: many(reminders),
}));
```

```ts
// labels.db.ts
export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
  task:  one(tasks,  { fields: [taskLabels.taskId],  references: [tasks.id] }),
  label: one(labels, { fields: [taskLabels.labelId], references: [labels.id] }),
}));

export const labelsRelations = relations(labels, ({ many }) => ({
  taskLabels: many(taskLabels),
}));
```

The Drizzle client is constructed with both schema tables and the relations registered. Query API auto-infers nested types.

### Why this over manual `leftJoin` for hydration

A `db.select().leftJoin(...).leftJoin(...)` for a one-to-many + many-to-many hydration produces a cartesian product (one row per `task × label × reminder` combination), requires manual deduplication by id (Map trick), forces hand-typed return shapes, and is bug-prone:

```ts
// rejected for hydration
async findByIdHydrated(taskId: string, userId: string) {
  const rows = await db
    .select({ task: tasks, taskLabel: taskLabels, label: labels, reminder: reminders })
    .from(tasks)
    .leftJoin(taskLabels, eq(taskLabels.taskId, tasks.id))
    .leftJoin(labels,     eq(labels.id, taskLabels.labelId))
    .leftJoin(reminders,  eq(reminders.taskId, tasks.id))
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
  if (rows.length === 0) return null;

  const task = rows[0].task;
  const labelMap = new Map<string, Label>();
  const reminderMap = new Map<string, Reminder>();
  for (const row of rows) {
    if (row.label)    labelMap.set(row.label.id, row.label);
    if (row.reminder) reminderMap.set(row.reminder.id, row.reminder);
  }
  return {
    ...task,
    labels:    [...labelMap.values()],
    reminders: [...reminderMap.values()],
  };
}
```

3 labels × 5 reminders = 15 rows for one task; dedup needed; return shape hand-built and hand-typed.

Drizzle's relational queries instead run separate batched subqueries behind the scenes (1 query for the root + 1 per relation, batched by IN-clause for collections) — no cartesian blowup, native nested return, types inferred. Network/latency trade-off (3-4 short queries vs 1 big JOIN) is negligible at this scale.

### Where `leftJoin` IS still used

When filtering the root entity by a related entity's column — Drizzle's relational query API can't express this. Example: "all tasks that carry a label named `security`":

```ts
async findTasksWithLabelName(labelName: string, userId: string): Promise<Task[]> {
  return db
    .select({ task: tasks })
    .from(tasks)
    .innerJoin(taskLabels, eq(taskLabels.taskId, tasks.id))
    .innerJoin(labels,     eq(labels.id, taskLabels.labelId))
    .where(and(eq(labels.name, labelName), eq(tasks.userId, userId)))
    .then(rows => rows.map(r => r.task));
}
```

Rule: relational queries for **hydrating the root**, leftJoin for **filtering the root by a related value**.

## Rejected alternatives

### A · Proliferate methods (`findById`, `findByIdWithLabels`, `findByIdWithReminders`, `findByIdHydrated`, …)

Each method has a fully-typed, named return. Explicit and readable per call. Combinatorial cost: 2ⁿ methods for n relations (4 for 2; 16 for 4). Most variants would never be called. Bare + hydrated cover the actual real-world calls. **Rejected** as preemptive over-engineering.

### B · Single method with options object + conditional return type

```ts
// rejected
type HydrateOpts = { labels?: boolean; reminders?: boolean };
type Hydrated<T extends HydrateOpts> =
  Task
  & (T['labels']    extends true ? { labels: Label[] }       : {})
  & (T['reminders'] extends true ? { reminders: Reminder[] } : {});

findById<T extends HydrateOpts = {}>(
  taskId: string,
  userId: string,
  opts?: T,
): Promise<Hydrated<T> | null>;
```

Solves the combinatorial problem with one method. Cost: dense TypeScript machinery at call sites (readers must parse `Hydrated<T>` to know what they're getting). The complexity isn't justified at this codebase's scale — most callers want bare or fully hydrated. **Rejected** for type-readability cost.

### Manual `leftJoin` for hydration

See above. Rejected: cartesian product, manual dedup, hand-typed return, bug-prone. Retained for the narrower "filter root by related value" case where Drizzle's relational API can't express the query.

## Drizzle relations v1 vs v2

Drizzle is moving toward a v2 relations API with consolidated `defineRelations(schema, r => ({...}))`, renamed fields (`from`/`to`/`alias`), and simplified M2M (`r.X.id.through(r.junction.Y)`). As of writing, `drizzle-orm@0.45.2` (our installed version) ships **only v1** — `defineRelations` is not exported. v2 is documented but unreleased.

**Adopt v1 now. Track v2 migration as a follow-up** for when it lands in a stable release. The migration is mechanical:

- Replace per-file `relations()` blocks with one centralized `defineRelations(schema, ...)`.
- Rename `fields` → `from`, `references` → `to`, `relationName` → `alias`.
- Rewrite M2M with `r.X.id.through(...)` (less code than v1's two-half approach).
- Drizzle provides `db._query` as the v1 fallback during migration; `db.query` becomes v2.

This ADR is **not** superseded when migration happens — the decision (hydrated pair + relational queries) is unchanged. A short follow-up note will be added here once migration completes.

## Consequences

- Repository methods exist in pairs: bare + hydrated. Most consumers use one of the two; middle-ground reads are added only when a real call site appears.
- `relations()` blocks live alongside table definitions in each `*.db.ts` file. One small block per file. This is duplicated metadata with `references()` (DB-level FK constraint) — annoying but unavoidable in v1; v2 consolidates the location.
- The Drizzle client is constructed with the full schema + relations registered.
- `db.select().leftJoin()` remains the right tool for "filter root by related value" — not banned, just scoped.
- The `HydratedX` type is hand-declared per feature (a named intersection of bare + relations). Self-documenting return shapes.

See also: [ADR-0008 (layer model)](./0008-backend-layer-model.md), [ADR-0010 (repository validates on exit)](./0010-repository-validates-on-exit.md), and the [Backend coding-practices](../../../llm/coding-practices.md#backend-hono--drizzle--zod).
