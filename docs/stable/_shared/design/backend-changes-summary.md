---
created: 2026-05-14
updated: 2026-05-14
summary: Consolidated checklist of every backend change surfaced across design specs 01–05. Schema migrations + endpoint additions + deferred items, grouped for the backend planning round.
---

# Backend changes — summary

Single-page checklist of everything the v1 design needs from the backend. Each item references the design spec that surfaced it. Use this in the backend planning round as the authoritative list.

Legend:

- 🟢 **Planned for v1** — agreed during design; needs to happen before / alongside frontend implementation.
- 🟡 **Deferred** — explicitly out of v1; tracked for v1.5/v2.
- ✅ **No change needed** — design uses existing capability as-is.

## Quick summary

| Area | Change | Status | Spec |
|---|---|---|---|
| `tasks` schema | Drop `isRecurring` column | 🟢 | 03 · Task detail |
| `tasks` schema | Add `deletedAt: timestamp nullable` | 🟢 | 03 · Task detail |
| `tasks` schema | Add `position: integer` for kanban reorder | 🟡 | 03 · Project page |
| `reminders` schema | Add `deletedAt: timestamp nullable` | 🟢 | 03 · Task detail / Inbox |
| `reminders` schema | Add `acknowledgedAt: timestamp nullable` | 🟡 | 03 · Inbox |
| `projects` schema | Add `color: text NOT NULL` (hash-default migration) | 🟢 | 03 · Calendar / Projects |
| `labels` schema | Change `color` to `NOT NULL` (hash-backfill migration) | 🟢 | 03 · Labels |
| `labels` schema | Add `deletedAt: timestamp nullable` | 🟢 | 03 · Labels |
| New table | `task_events` (activity log) | 🟡 | 03 · Task detail |
| New table | `comments` | 🟡 | 03 · Task detail |
| New table | `notifications` | 🟡 | 03 · Inbox |
| New table or column blob | `users/preferences` | 🟡 (localStorage v1) | 03 · Settings |
| `GET /tasks` | Multi-value query params (project, status, priority, label as arrays) | 🟢 | 03 · All tasks |
| `GET /tasks` | Date-range params (`dueDateGte`, `dueDateLte`) | 🟢 | 03 · All tasks |
| `GET /tasks` | Text search (`q` — title contains, case-insensitive) | 🟢 | 03 · All tasks |
| `GET /tasks` | Filter `deletedAt IS NULL` by default | 🟢 | cross-cutting (soft delete) |
| `GET /tasks/duplicate` (or similar) | New endpoint for task duplication | 🟡 | 03 · Task detail |
| `GET /reminders` | Multi-value `taskId` filter | 🟢 | 03 · Project page |
| `GET /reminders` | Range filters (`remindAtGte`, `remindAtLte`) | 🟢 | 03 · Inbox |
| `GET /reminders` | Filter `deletedAt IS NULL` by default | 🟢 | cross-cutting (soft delete) |
| `PATCH /labels/:id` | Accept `removeFromTasks: boolean` flag (two-mode delete) | 🟢 | 03 · Labels |
| `DELETE /labels/:id` | New endpoint — permanent delete; server-validates already soft-deleted | 🟢 | 03 · Labels |
| `GET /labels` | Include per-label task count (filtered by live tasks) | 🟢 | 03 · Labels |
| `GET /labels` | Filter `deletedAt IS NULL` by default | 🟢 | cross-cutting (soft delete) |
| `GET /export/tasks` | New endpoint — JSON bundle of user data | 🟢 | 03 · Settings |
| `GET /export/preferences` | New endpoint — JSON blob of user preferences | 🟢 | 03 · Settings |
| `POST /import/*` | Import endpoints | 🟡 | 03 · Settings |
| `GET/PATCH /users/preferences` | Preferences endpoints (server-side sync) | 🟡 (v1.5; localStorage v1) | 03 · Settings |
| BetterAuth | All auth covered as-is | ✅ | 03 · Auth |

---

## Schema changes (migrations)

> **Note**: the SQL below is **illustrative only** — it documents the shape of each migration in a familiar language. **Actual migrations are written in Drizzle** and generated via `bun --cwd apps/backend run db:generateMigration`, then applied with `db:migrate`. The Drizzle schema files (`apps/backend/src/features/*/*.db.ts`) are the source of truth; the SQL examples mirror the resulting `pg_dump` shape for review purposes.

### Migration 1 — `tasks` cleanup + soft delete

```sql
ALTER TABLE tasks
  DROP COLUMN is_recurring,
  ADD COLUMN deleted_at TIMESTAMP NULL;

CREATE INDEX idx_tasks_user_active ON tasks(user_id) WHERE deleted_at IS NULL;
```

Code follow-ups:

- Replace any `task.isRecurring` reads with `task.recurringInterval !== 'none'`.
- All list endpoints filter `deleted_at IS NULL` by default.
- Soft-delete write: `UPDATE tasks SET deleted_at = NOW() WHERE id = :id`.

### Migration 2 — `reminders` soft delete

```sql
ALTER TABLE reminders
  ADD COLUMN deleted_at TIMESTAMP NULL;

CREATE INDEX idx_reminders_user_active ON reminders(user_id) WHERE deleted_at IS NULL;
```

Same default-filter convention. The Inbox "Now" bucket query becomes:

```sql
SELECT * FROM reminders
WHERE user_id = :uid
  AND deleted_at IS NULL
  AND remind_at <= NOW();
```

### Migration 3 — `projects.color`

```sql
ALTER TABLE projects
  ADD COLUMN color TEXT NULL;

-- Backfill: deterministic hash of name → hex. Implementation detail; can be done in app code via one-time script.
UPDATE projects SET color = hash_to_hex(name) WHERE color IS NULL;

ALTER TABLE projects ALTER COLUMN color SET NOT NULL;
```

Hash function: take SHA-1 (or simpler) of the name, map to a curated 12-color palette (see spec 04 color picker). Deterministic — same name produces same color.

### Migration 4 — `labels.color` to NOT NULL + soft delete

```sql
ALTER TABLE labels
  ADD COLUMN deleted_at TIMESTAMP NULL;

-- Backfill missing colors using same hash trick as projects.
UPDATE labels SET color = hash_to_hex(name) WHERE color IS NULL;

ALTER TABLE labels ALTER COLUMN color SET NOT NULL;

CREATE INDEX idx_labels_user_active ON labels(user_id) WHERE deleted_at IS NULL;
```

---

## Endpoint changes

### `GET /tasks`

Current query params: `projectId`, `status`, `priority`, `dueDate` (single values).

Extend to:

| Param | Type | Notes |
|---|---|---|
| `projectId` | single OR `projectId=A,B` OR repeated | multi-value, OR semantics within field |
| `status` | single OR array | enum `todo / in_progress / done` |
| `priority` | single OR array | enum `low / medium / high` |
| `labelId` | single OR array | requires JOIN with `task_labels` |
| `dueDateGte`, `dueDateLte` | ISO timestamps | range, inclusive |
| `q` | string | title contains, case-insensitive |
| `includeDeleted` | boolean (default false) | when true, returns soft-deleted rows too |
| (existing) `dueDate` | ISO | preserved for backwards compat (= `dueDateGte=X&dueDateLte=X` on same day) |

Default filter: `tasks.deleted_at IS NULL` unless `includeDeleted=true`.

### `GET /reminders`

Extend to:

| Param | Type | Notes |
|---|---|---|
| `taskId` | single OR array | multi-value |
| `remindAtGte`, `remindAtLte` | ISO timestamps | range |
| `includeDeleted` | boolean (default false) | mirror of tasks |

Default filter: `reminders.deleted_at IS NULL` unless overridden.

### `GET /labels`

Extend response shape:

```jsonc
{
  "data": [
    {
      "id": "…",
      "name": "backend",
      "color": "#67E8F9",
      "deletedAt": null,
      "taskCount": 8   // ← NEW: count of LIVE tasks with this label
    },
    …
  ]
}
```

`taskCount` is computed as a JOIN against `task_labels` filtered by `tasks.deleted_at IS NULL`. If JOIN cost becomes a concern, split into a separate `GET /labels/:id/usage` endpoint (decide at implementation).

Default filter: `labels.deleted_at IS NULL`.

### `PATCH /labels/:labelId` — two-mode delete

Accept `removeFromTasks: boolean` along with the standard fields.

```jsonc
PATCH /labels/abc-123
{
  "deletedAt": "2026-05-14T12:00:00Z",
  "removeFromTasks": false
}
```

When `removeFromTasks: true`, in the same transaction also:

```sql
DELETE FROM task_labels WHERE label_id = :labelId;
```

When `false` or absent, only `deleted_at` is written; `task_labels` rows are preserved (so restore returns the label to all previously-tagged tasks).

### `DELETE /labels/:labelId` — permanent delete

- Server validates: `labels.deleted_at IS NOT NULL` (only soft-deleted labels can be permanently deleted).
- If validation fails, return `409 CONFLICT`.
- Otherwise hard `DELETE FROM labels WHERE id = :id`; FK cascade on `task_labels` (already configured `ON DELETE CASCADE`) cleans up join rows.

### `GET /export/tasks`

Response: JSON bundle of the authenticated user's data.

```jsonc
{
  "exportedAt": "2026-05-14T12:00:00Z",
  "version": 1,
  "tasks":     [...],   // all live tasks (or include deleted if param)
  "reminders": [...],   // all live reminders
  "projects":  [...],
  "labels":    [...],
  "taskLabels":[...]    // M2M rows
}
```

Optional query param: `includeDeleted=true` to include soft-deleted rows. Default false.

### `GET /export/preferences`

Response: JSON blob of the user's preferences (theme, density, handedness, etc.). Source = whatever store backs `users/preferences` at the time (localStorage shim in v1; real endpoint in v1.5).

### List endpoints joining `labels`

Anywhere the API renders task labels (task detail, all-tasks rows, label chips), the join with `labels` must filter `labels.deleted_at IS NULL` so chips for soft-deleted labels don't render. This is a cross-cutting concern, not a single endpoint change.

---

## Cross-cutting patterns

### Soft-delete pattern

Three tables now have `deletedAt`:

- `tasks.deleted_at`
- `reminders.deleted_at`
- `labels.deleted_at`

**Convention**: all list endpoints filter `deleted_at IS NULL` by default. An optional `includeDeleted=true` param flips the filter for "deleted items" admin views. Single-row reads (`GET /tasks/:id`) still return the row even if soft-deleted (so undo flows can re-show details before restoring), but PATCH/DELETE operations on a soft-deleted row may be rejected depending on context.

### Default values vs explicit defaults

Quick-add and column-quick-add flows send minimal payloads; the backend's column defaults handle the rest:

- `tasks.status` default `'todo'`
- `tasks.priority` default `'medium'`
- `tasks.recurringInterval` default `'none'`
- `tasks.dueDate` nullable

Frontend explicitly overrides `dueDate=today` on dashboard quick-add; everywhere else relies on backend defaults.

### Validation rules carried over from current schema

- Title required and non-empty (existing).
- Email format on reminders/etc. — not applicable; reminders use `title + content` strings.
- All `userId` fields enforced server-side from the BetterAuth session.

---

## Deferred (v1.5 / v2)

### v1.5 candidates

- **Reminders `acknowledgedAt`** — distinguishes "Done" from "Dismiss" in Inbox. Adds an additional column + flips the toggle from "soft-delete on both" to "acknowledgedAt for done, deletedAt for dismiss".
- **Deleted-items restore views** — list endpoints with `includeDeleted=true` already make this trivial; just need frontend pages for tasks/reminders/labels deleted lists.
- **Bulk operations on tasks** — `PATCH /tasks/bulk { ids[], updates }` or per-task PATCH loop. Pairs with All-tasks bulk-select UI.
- **Saved views** — either `GET/POST /views` table or embedded in preferences blob.
- **`users/preferences` endpoint** — server-side sync of the prefs currently in localStorage.
- **Pull-to-refresh** — no backend change; just frontend.
- **Tasks `position: integer`** — for kanban reorder within a column.
- **Duplicate-task endpoint** — `POST /tasks/:id/duplicate` returning the cloned task with new id. Or design as client-side compose (read task, POST new with cloned values).

### v2 candidates

- **Activity log** — new `task_events` table with `{ id, taskId, userId, type, payload (json), createdAt }`. Triggers per mutation (created, updated, completed, etc.).
- **Comments** — `comments` table tied to `taskId` + `userId`. Requires multi-user context.
- **Notifications** — `notifications` table for mentions, due-date warnings, etc. Surfaces in the Inbox alongside reminders.
- **Sharing / multi-user projects** — `users_projects` table already exists in the schema; building out the membership + permission semantics is its own design phase.
- **Attachments** — file storage + `task_attachments` join.
- **Subtasks** — recursive `tasks.parentId` or a dedicated join.

---

## Suggested implementation order

When the backend planning round runs, this order minimizes the dependency tangle:

1. **Soft-delete pattern** across `tasks`, `reminders`, `labels` (migrations 1, 2, 4 partial). Affects every list endpoint; do it first so subsequent endpoint changes incorporate it cleanly.
2. **`tasks.isRecurring` drop** (migration 1). Independent. Quick.
3. **`projects.color` + `labels.color` NOT NULL** (migrations 3, 4 finish). Backfill scripts.
4. **`GET /tasks` multi-value + range + text** filter extension. Largest endpoint surface change.
5. **`GET /reminders` multi-value + range** filter extension. Same pattern.
6. **`GET /labels` task-count + two-mode delete + permanent delete**. Cluster of label-specific changes.
7. **`GET /export/*` endpoints**. Independent of everything above.
8. (Out of scope: `users/preferences` endpoint, deferred to v1.5.)

After step 7, the frontend can be built against a stable backend matching this design.

---

## Next docs / phases

This summary completes the v1 design output. Pending:

- **Original-roadmap phase 2** — backend code structure / port newer-project eslint + prettier configs / refactor zod-using files (the zod-vs-zod-to-openapi fix from phase 1 may have removed most of the work). The schema changes above ride alongside this.
- **Original-roadmap phase 3** — refresh stable backend docs (`docs/stable/backend/*`) to match the post-refactor reality.
- **Original-roadmap phase 4** — coding styles, ADRs, decision records capturing the choices made through this whole design phase.
- **Implementation** — Vue/Nuxt scaffolding + per-page builds against the post-refactor backend.
