---
created: 2026-05-14
updated: 2026-05-14
summary: Deleting a label offers the user two soft-delete modes (keep task links, or remove from tasks). A third tier — permanent delete — is available only from the deleted-labels view. The `task_labels` M2M rows are preserved or wiped based on which mode is chosen.
status: accepted
---

# Two-mode label delete

When a [label](../glossary.md#label) is deleted, the user picks between **two soft-delete modes**:

1. **Keep task links** (default, less destructive) — writes `labels.deletedAt = now`; the `task_labels` join rows are untouched. The label disappears from chips and filters because every list query joins on `labels.deletedAt IS NULL`. If the user later restores the label, it reappears on every previously-tagged task automatically.
2. **Remove from tasks** — same `deletedAt` write **plus** `DELETE FROM task_labels WHERE labelId = :id` in the same transaction. Restoring the label later returns it without any tags.

A third tier — **permanent delete** — is only reachable from a deleted-labels view. It performs a hard `DELETE FROM labels`, with FK cascade on `task_labels` cleaning up any remaining join rows. No recovery.

This 3-tier model is non-obvious; a reader looking at a `PATCH /labels/:id` accepting a `removeFromTasks: boolean` flag will want to know why the same endpoint sometimes wipes M2M rows. This ADR is that explanation.

Alternatives considered: a single delete mode (either keep or remove, but not the user's choice) — rejected because users want both restoration behaviors; some labels are renamed/re-organized (keep), others are abandoned (remove).

See [`03-page-wireframes.md` § Labels](../design/03-page-wireframes.md) and [`backend-changes-summary.md`](../design/backend-changes-summary.md).
