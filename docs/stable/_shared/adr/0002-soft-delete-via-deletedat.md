---
created: 2026-05-14
updated: 2026-05-14
summary: Tasks, reminders, and labels are soft-deleted via a nullable `deletedAt` timestamp. All list endpoints filter `deletedAt IS NULL` by default; an `includeDeleted=true` param flips the filter for restore views.
status: accepted
---

# Soft delete via `deletedAt`

[Tasks](../glossary.md#task), [reminders](../glossary.md#reminder), and [labels](../glossary.md#label) are never hard-deleted by user-facing actions. A nullable `deletedAt: timestamp` column on each table records the soft-delete; all list endpoints filter `deletedAt IS NULL` by default, with an `includeDeleted=true` query param to surface deleted rows for restore views. This enables undo flows, "deleted items" surfaces, and the [two-mode label delete](./0007-two-mode-label-delete.md) without losing data. Hard deletion is reserved for a permanent-delete action explicitly available only from the deleted-items view.

Alternatives considered: hard delete + audit log (more complex, harder to restore); separate "trash" table per entity (more migrations, more JOINs). The single-column convention is the lowest-friction path.

See [`backend-changes-summary.md`](../design/backend-changes-summary.md) for the cross-cutting migration plan.
