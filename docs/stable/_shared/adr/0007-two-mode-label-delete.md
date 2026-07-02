---
created: 2026-05-14
updated: 2026-07-02
summary: Deleting a label offers the user two soft-delete modes (keep task links, or remove from tasks). A third tier — permanent delete — is available only from the deleted-labels view. All three tiers live on the single `DELETE /labels/:labelId` endpoint, selected via query flags (`removeFromTasks=true`, `permanent=true`); combining the two flags is a 400.
status: accepted
---

# Two-mode label delete

When a [label](../glossary.md#label) is deleted, the user picks between **two soft-delete modes**:

1. **Keep task links** (default, less destructive) — writes `labels.deletedAt = now`; the `task_labels` join rows are untouched. The label disappears from chips and filters because every list query joins on `labels.deletedAt IS NULL`. If the user later restores the label, it reappears on every previously-tagged task automatically.
2. **Remove from tasks** — same `deletedAt` write **plus** `DELETE FROM task_labels WHERE labelId = :id` in the same transaction. Restoring the label later returns it without any tags.

A third tier — **permanent delete** — is only reachable from a deleted-labels view. It performs a hard `DELETE FROM labels`, with FK cascade on `task_labels` cleaning up any remaining join rows. No recovery.

## API surface — one DELETE route, query flags

All three tiers live on `DELETE /labels/:labelId`:

| Call | Tier | Behavior |
|---|---|---|
| `DELETE /labels/:labelId` | 1 | Soft delete, `task_labels` untouched |
| `DELETE /labels/:labelId?removeFromTasks=true` | 2 | Soft delete + wipe join rows (same transaction) |
| `DELETE /labels/:labelId?permanent=true` | 3 | Hard delete; **409 CONFLICT** unless the label is already soft-deleted; FK cascade cleans join rows |
| `DELETE /labels/:labelId?permanent=true&removeFromTasks=true` | — | **400 BAD_REQUEST** — the combo signals a client misunderstanding (`permanent` makes `removeFromTasks` moot via cascade); reject loudly rather than guess |

Mode signals are query params on the DELETE endpoint per the two-mode-parent-delete convention in [`docs/llm/coding-practices.md`](../../../llm/coding-practices.md) — never a request body (DELETE bodies are not standardized), and never a `deletedAt` field in a PATCH body (`deletedAt` is server-controlled per [ADR-0002](./0002-soft-delete-via-deletedat.md); an earlier design-phase draft that routed soft-delete through `PATCH /labels/:labelId` with `deletedAt` + `removeFromTasks` in the body is superseded by this shape). A dedicated `DELETE /labels/:labelId/permanent` sub-route was rejected: "delete the permanent sub-resource" reads wrongly, and [ADR-0014](./0014-endpoint-shape-rules.md)'s dedicated-action shape is `POST /:id/<action>` — introducing a DELETE sub-path would add a third unprecedented endpoint shape.

Alternatives considered: a single delete mode (either keep or remove, but not the user's choice) — rejected because users want both restoration behaviors; some labels are renamed/re-organized (keep), others are abandoned (remove).

See [`03-page-wireframes.md` § Labels](../design/03-page-wireframes.md) and [`backend-changes-summary.md`](../design/backend-changes-summary.md).
