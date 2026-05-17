---
created: 2026-05-18
updated: 2026-05-18
summary: `tasks.projectId` FK uses `ON DELETE SET NULL` — deleting a project unlinks its tasks rather than cascading. The API exposes a two-mode delete (default orphan · opt-in cascade-soft-delete) generalizing the pattern from ADR-0007. A "smart rebind on restore" is deferred to v1.5 (requires `tasks.originalProjectId` snapshot field).
status: accepted
---

# Project delete orphans tasks (`SET NULL`) + two-mode delete UX

A task's relationship to a project is **optional** — `tasks.projectId` is nullable, and users can create "generic" tasks not bound to any project. The FK `tasks.projectId → projects.id` uses `ON DELETE SET NULL`, NOT `CASCADE`: deleting a project orphans its tasks (`projectId` becomes null) rather than destroying them. This matches the soft-delete philosophy of [ADR-0002](./0002-soft-delete-via-deletedat.md) — never silently destroy user work. Future contributors seeing `SET NULL` as the lone non-cascade in a schema full of cascades should NOT treat it as a bug.

At the application layer, `DELETE /projects/:projectId` exposes a **two-mode delete** generalizing the label pattern from [ADR-0007](./0007-two-mode-label-delete.md):

- **Mode 1 — orphan tasks (default, safer)**: project soft-deleted (`projects.deletedAt = now`); DB FK action sets `tasks.projectId = NULL` for every child task; tasks survive in the "Unfiled" state. Triggered by `DELETE /projects/:projectId` with no query params.
- **Mode 2 — cascade soft-delete to tasks**: project soft-deleted AND every child task soft-deleted (`tasks.deletedAt = now`) in the same transaction. Reminders for those tasks already cascade-soft-delete because reminders are tied to tasks. Triggered by `DELETE /projects/:projectId?cascadeTasks=true`.

Query-param flag — not body — because DELETE bodies are not standardized across clients/proxies.

## Restore behavior

Restoring a soft-deleted project (`projects.deletedAt = null`) under v1:

- **Tasks orphaned in Mode 1 stay orphaned.** They were unlinked at delete time; restore re-creates the project but does not auto-rebind. User reassigns manually.
- **Tasks cascade-soft-deleted in Mode 2 stay soft-deleted.** Restore is for the parent; the user explicitly chose to delete the children at delete time. Symmetric with [ADR-0007](./0007-two-mode-label-delete.md)'s Mode 2.

## v1.5 enhancement — smart rebind on restore (deferred)

Tracked for v1.5. Adds a `tasks.originalProjectId uuid nullable` snapshot field. Behavior:

- On project soft-delete (Mode 1): service snapshots `originalProjectId = projectId` for each affected task before nullifying `projectId`.
- On project restore: for each task where `originalProjectId = restored.id`:
  - if `projectId IS NULL` → rebind to the restored project, clear `originalProjectId`.
  - if `projectId IS NOT NULL` (user reassigned to another project while X was soft-deleted) → leave `projectId` alone, clear `originalProjectId` (snapshot is now moot).

Locked edge cases:

1. **User reassigns mid-soft-delete**: respected on restore. The task stays in its new project.
2. **User explicitly nulls projectId mid-soft-delete**: the rebind heuristic still rebinds (treats it as "still detached"). Workaround for users who genuinely want permanent detachment: reassign to a different project then back to null, or wait for the restore + manually re-detach. Acceptable edge case.
3. **Soft-deleted tasks during project restore**: NOT auto-unrestored regardless of mode. The deletion was deliberate; restore doesn't undo it.

## Pattern generalization · two-mode parent delete

This is the second instance of the pattern (labels was first, ADR-0007). Codifying as a coding-practice:

> Destructive operations on an entity that owns child entities offer **two delete modes**: (1) keep children but unlink (default — DB-level FK action handles the unlink), (2) cascade-soft-delete the children at the service layer (explicit user opt-in). Permanent (hard) delete from the deleted-items view is a separate third tier; cascade behavior at that tier mirrors the DB's FK action.

Applies to any future parent-child relationship (e.g. if subtasks land — task→subtasks).

## Edge cases noted

- **Recurring tasks orphaned in Mode 1**: keep firing. They have `dueDate` + `recurringInterval`, the scheduler keeps spawning. User sees them in the "Unfiled" filter. Acceptable.
- **Reminders on orphaned tasks**: stay alive (tied to task, not project).
- **Hard-delete a soft-deleted project** (from the deleted-projects view, v1.5+): DB FK cascade fires `SET NULL` on remaining task references. Tasks survive permanently as unfiled. If a user wants the tasks hard-deleted too, the deleted-tasks view handles that separately.

## Documented in

- Coding-practices: [Backend · Two-mode parent delete](../../../llm/coding-practices.md#backend-hono--drizzle--zod).
- Glossary: [Two-mode parent delete](../glossary.md#two-mode-parent-delete-pattern).

See also: [ADR-0002 (soft-delete)](./0002-soft-delete-via-deletedat.md), [ADR-0007 (two-mode label delete)](./0007-two-mode-label-delete.md), [ADR-0014 (endpoint shape)](./0014-endpoint-shape-rules.md).
