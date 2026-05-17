---
created: 2026-05-18
updated: 2026-05-18
summary: The `users_projects` junction table exists in the schema as scaffolding for a future multi-user iteration whose first feature is project sharing (multiple users seeing each other's tasks attached to the same project). v1 is single-user — no application code reads or writes this table, but it must NOT be dropped during cleanup.
status: accepted
---

# `users_projects` table reserved for future multi-user sharing

The schema defines a `users_projects` junction table (userId × projectId, with createdAt/updatedAt) that is **unused at the application level in v1**. It exists deliberately as scaffolding for a future multi-user iteration whose first feature will be **project sharing** — multiple users attached to the same project, seeing each other's tasks under that project. Future contributors performing schema cleanup must NOT drop this table on the assumption that it's dead. Future contributors planning the multi-user iteration should start from this table — not by recreating it from scratch — to preserve the existing migration history.

When sharing is implemented:

- Membership rows are inserted/deleted via a (future) `members` API on the project (`POST /projects/:projectId/members`, etc.).
- Authorization on existing project endpoints checks `users_projects` (in addition to the legacy `projects.userId = currentUser`) to determine access.
- Project-list reads UNION the user's owned projects + projects they're a member of.
- Soft-delete semantics on members (vs hard delete) is an open question for that phase.

This ADR exists only to **lock the table's preservation rationale**; the membership UX and authorization model are not in scope here and will get their own ADR(s) when that phase lands.

See [glossary `users_projects`](../glossary.md#users_projects-table-future-sharing-scaffold) for the cross-link.
