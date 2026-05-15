---
created: 2026-05-14
updated: 2026-05-14
summary: The `tasks.isRecurring` boolean column is dropped; `tasks.recurringInterval` enum (`daily | weekly | monthly | none`) is the sole source of truth for whether and how a task recurs.
status: accepted
---

# Drop `tasks.isRecurring`

The original `tasks` schema carried two fields encoding recurrence: a boolean `isRecurring` and an enum `recurringInterval` whose values included `'none'`. The two could disagree (`isRecurring=true, recurringInterval='none'` is meaningless but allowed). The boolean is **dropped**; the enum value alone determines recurrence — `none` means single occurrence, any other value means recurring at that cadence. Code paths reading `task.isRecurring` switch to `task.recurringInterval !== 'none'`.

A future reader looking at the schema will see only the enum and may wonder why `isRecurring` doesn't exist as a derived helper or boolean column. This ADR is the record that the redundancy was a known mistake, fixed deliberately.

See [`docs/stable/_shared/glossary.md#recurrence`](../glossary.md#recurrence-task-status) and [`backend-changes-summary.md`](../design/backend-changes-summary.md).
