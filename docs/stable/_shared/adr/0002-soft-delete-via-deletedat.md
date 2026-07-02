---
created: 2026-05-14
updated: 2026-07-02
summary: Tasks, reminders, and labels are soft-deleted via a nullable `deletedAt` timestamp. All reads — list AND single-row — filter `deletedAt IS NULL` by default; an `includeDeleted=true` param flips the filter for restore/deleted-items views. Restore happens via dedicated `POST /:resource/:id/restore` domain-verb endpoints.
status: accepted
---

# Soft delete via `deletedAt`

[Tasks](../glossary.md#task), [reminders](../glossary.md#reminder), and [labels](../glossary.md#label) are never hard-deleted by user-facing actions. A nullable `deletedAt: timestamp` column on each table records the soft-delete. This enables undo flows, "deleted items" surfaces, and the [two-mode label delete](./0007-two-mode-label-delete.md) without losing data. Hard deletion is reserved for a permanent-delete action explicitly available only from the deleted-items view.

## Read visibility — one convention for list and single-row reads

Every read endpoint filters `deletedAt IS NULL` by default and accepts `includeDeleted=true` to opt in to seeing soft-deleted rows:

- **List reads** (`GET /tasks`, `GET /reminders`, `GET /labels`): default filter hides deleted rows; `includeDeleted=true` surfaces them for the deleted-items view.
- **Single-row reads** (`GET /tasks/:taskId`, etc.): a soft-deleted row is a **404** by default; `includeDeleted=true` returns it (used by the deleted-items detail view). A stale bookmark to a deleted entity correctly 404s.

The uniform param keeps one mental model across the whole read surface; no endpoint silently diverges. (An earlier design-phase draft had single-row reads returning soft-deleted rows unconditionally — rejected: it made deletion invisible to direct-link consumers and split the convention in two.)

## Writes against soft-deleted rows

`UPDATE`-shaped operations (unified PATCH, domain verbs) target only live rows — repositories include `deletedAt IS NULL` in the write's WHERE. A soft-deleted row is therefore immutable through the normal write surface.

**Restore** is a dedicated domain-verb endpoint per entity — `POST /tasks/:taskId/restore` (same for reminders / labels) — which nulls `deletedAt`. It earns a dedicated endpoint under the dedication test of [ADR-0014](./0014-endpoint-shape-rules.md): restore has domain semantics beyond a field flip (it resurrects the row into every default-filtered view), and the unified PATCH cannot express it because `deletedAt` is server-controlled and omitted from update schemas.

Alternatives considered: hard delete + audit log (more complex, harder to restore); separate "trash" table per entity (more migrations, more JOINs); accepting `deletedAt` in PATCH bodies for restore (rejected — server-controlled columns stay out of client-writable schemas). The single-column convention is the lowest-friction path.

See [`backend-changes-summary.md`](../design/backend-changes-summary.md) for the cross-cutting migration plan.
