---
created: 2026-05-18
updated: 2026-05-18
summary: Auth tables (managed by BetterAuth) use `text` primary keys; app feature tables use Postgres `uuid` with `defaultRandom()`. The boundary is deliberate — don't harmonize. Cross-type FKs `feature.userId text → users.id text` are intentional.
status: accepted
---

# ID type boundary: `text` for auth (BetterAuth), `uuid` for app features

Authentication-related tables (`users`, `sessions`, `accounts`, `verifications`) use `text` primary keys because BetterAuth manages them — its session-token generation produces string ids (nanoid-flavored) and its migration tools expect `text` columns. App feature tables (`tasks`, `projects`, `labels`, `reminders`, `users_projects`) use `uuid` with `defaultRandom()`, the Postgres-idiomatic choice (16-byte storage, native btree indexing, `gen_random_uuid()` for generation). The boundary is deliberate — harmonizing in either direction is a regression: changing auth ids to `uuid` breaks BetterAuth's contract; changing app ids to `text` loses uuid's storage + indexing advantages. Cross-type FK columns at `<feature>.userId text → users.id text` are intentional and correct (the FK column matches the referenced column type).

## Don't introduce new `text`-id feature tables without revisiting this ADR

A future contributor adding a feature table with a `text` primary key should first reconsider — `uuid` is the convention. Legitimate exceptions exist (slug-as-id for SEO-friendly URLs, external-system foreign keys propagated as PK, human-readable identifiers like `TASK-1234`) but none apply to the current single-user task-manager scope. If one becomes relevant, supersede this ADR with the rationale rather than introducing the new pattern silently.

See [`apps/backend/src/features/*/`](../../../../apps/backend/src/features/) for the current schema. Reviewers seeing `text` and `uuid` mixed in FK chains should NOT treat it as a bug.
