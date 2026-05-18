---
created: 2026-05-18
updated: 2026-05-18
summary: Backend grill-with-me round 1 fully complete. All 17 architectural/behavioral items locked in ADRs 0008–0020 + ~22 coding-practice rules + ~15 glossary entries. 2 TS style pre-locks added. What remains is a fix phase (~19 items, 13 of them ADR-mandated wiring) followed by a deferred TS style grill round. This doc is the cold-boot brief for the next chat session.
---

# Handoff — backend grill round 1 complete (2026-05-18)

**Status**: round 1 grilling **fully done**. No more architectural decisions to make. What remains is **executing the code fixes** that the new ADRs and coding-practices mandate, plus a few mechanical cleanups.

This handoff is written so a fresh chat can pick up cold from `CLAUDE.md` + this doc alone. ADRs and coding-practices are the load-bearing references — read them on demand, not preemptively.

## How to use this handoff

1. Read [CLAUDE.md](../../../CLAUDE.md) at the root.
2. Read this handoff end-to-end (~5 min).
3. Skip the section "Locked decisions" on first pass — only dive in if a fix references an ADR you haven't internalised.
4. Start fix phase at the **Security cluster** (#30 #31 #32). Then ADR-wiring cluster. Then mechanical cleanup.
5. User commits manually after each logical group — never auto-commit (per [pause-workflow memory rule](#dont-list)).
6. When fix phase done → run Phase Z (TS style grill round) → then delete the plan file + this handoff + the 2026-05-16 handoff.

## Locked decisions — round 1 grills (reference)

All decisions live in repo files, not in conversation memory. Authoritative sources:

- ADRs · [`docs/stable/_shared/adr/0008.md` through `0020.md`](../../stable/_shared/adr/)
- Coding rules · [`docs/llm/coding-practices.md`](../../llm/coding-practices.md) — Backend + TypeScript sections
- Concepts · [`docs/stable/_shared/glossary.md`](../../stable/_shared/glossary.md) — Backend concepts section

One-line summary per item (link points to the canonical source):

### Architecture & layers

- **Item 1 · Service layer purpose** — keep layer; pass-through allowed within feature. [ADR-0008](../../stable/_shared/adr/0008-backend-layer-model.md).
- **Item 2 · Repository validates on exit** — Zod-parse at exit; throws `RepositoryValidationError`. [ADR-0010](../../stable/_shared/adr/0010-repository-validates-on-exit.md).
- **Cross-feature call rules** — reads → repo; writes/operations → service; DAG only. [ADR-0009](../../stable/_shared/adr/0009-cross-feature-call-rules.md).
- **Integration client layer** — convention captured ahead of first use. Glossary + coding-practice; no ADR.

### Reads & error handling

- **Hydrated-read shape** — bare + hydrated method pair via Drizzle relational queries v1 (v2 migration tracked). [ADR-0011](../../stable/_shared/adr/0011-hydrated-read-interface.md).
- **Item 3 · Error propagation (pattern α)** — service throws `DomainError` · global handler maps via `DOMAIN_ERROR_MAP` registry · no try/catch in controllers · `showToClient` flag (default false). [ADR-0012](../../stable/_shared/adr/0012-error-propagation-pattern.md).
- **`safe()` utility** — `Result<T, E>` discriminated union (object flavor) for opt-in error inspection. [ADR-0013](../../stable/_shared/adr/0013-safe-utility-for-error-inspection.md).

### Endpoint & logging

- **Item 4 · Endpoint shape γ** — unified `PATCH /:resource/:id` + dedicated `POST /:resource/:id/<action>` for side-effecting verbs + dedicated `GET /:resource/:id/hydrated`. Drops 4 granular PATCH endpoints. [ADR-0014](../../stable/_shared/adr/0014-endpoint-shape-rules.md).
- **Item 5 · `requestId` via AsyncLocalStorage** — every log line auto-tags requestId without signature thread-through. Default log set + structured calls + pretty-dev/JSON-prod + pino as future swap. [ADR-0015](../../stable/_shared/adr/0015-request-id-via-asyncLocalStorage.md).

### Schema decisions

- **Item 6 · ID type boundary** — auth tables = `text` (BetterAuth-driven); app features = `uuid defaultRandom()`. Cross-type FKs intentional. [ADR-0016](../../stable/_shared/adr/0016-id-type-boundary.md).
- **Item 7 · Project delete orphans tasks** — `SET NULL` at FK + two-mode delete (orphan default · cascade-soft-delete via `?cascadeTasks=true`). A2 "smart rebind on restore" deferred to v1.5 via `tasks.originalProjectId` snapshot column. [ADR-0017](../../stable/_shared/adr/0017-project-delete-orphans-tasks.md).
- **Item 8 · `createdAt` + `updatedAt` uniformity** — every app feature table carries both, NOT NULL, `$onUpdate` bumps `updatedAt`. Backfill with `now()`. Auth tables exempt. [ADR-0018](../../stable/_shared/adr/0018-createdat-updatedat-on-feature-tables.md).
- **Item 9 · Enums validated at app boundary** — no DB `CHECK` / `pgEnum`. Revisit when external writers gain DB access. [ADR-0019](../../stable/_shared/adr/0019-enum-validation-at-app-boundary-only.md).
- **Item 16 · `users_projects` preserved for future sharing** — table exists in schema; reserved scaffolding for multi-user iteration whose first feature is project sharing. Do NOT drop during cleanup. [ADR-0020](../../stable/_shared/adr/0020-users-projects-table-reserved-for-future-sharing.md).

### Conventions & style

- **Item 10 · Drizzle query style** — one `.where(and(...))` per query · conditions array for dynamic filters · never multiple `.where()` calls (replace semantics = silent bugs). Audit surfaced 2 bugs (#30 #31 below). Coding-practice rule; no ADR.
- **Item 11 · Route param naming** — entity-prefixed `:taskId` / `:labelId` / `:reminderId`, never bare `:id`. Coding-practice rule.
- **Item 12 · Method-name plurality** — singular method returns one entity (`getTaskById`); plural returns many (`getTasks`). Coding-practice rule.
- **Item 13 · Service method naming** — three shapes: generic CRUD (`createX` / `getX` / `updateX` / `deleteX`) · domain verbs (`assignLabelToTask`, `completeTask`) · granular field-setters **forbidden** (`updateTaskStatus` etc.). Absorbed by ADR-0008 + ADR-0014; no new ADR.
- **Item 14 · Zod `.omit()` vs `.pick()`** — `.omit()` default for feature tables · `.pick()` reserved for junction/composite-PK tables.
- **Item 15 · Auth context keys** — `AUTH_CTX_KEYS` `as const` module · type-safe via Hono `Variables` generic · same pattern for any future request-scoped data.
- **Item 17 · BetterAuth-owned tables off-limits** — `users` · `sessions` · `accounts` · `verifications` are BetterAuth's contract. Don't migrate to satisfy app conventions. Glossary + coding-practice; no ADR.
- **TS style pre-locks** (2 rules) — arrow-default for module-level definitions; `type` default, `interface` only for declaration merging or public-API extension. Coding-practices TypeScript section.

## Pending code fixes

Total: **19 items**. Grouped by commit cluster for review tractability. User commits manually after each cluster.

Quick legend: 🔴 security · 📐 ADR-mandated wiring · 🧹 mechanical cleanup.

### Cluster A · Security (do FIRST)

| #  | Path:line                                       | Fix                                                                                                                                                                              | Mandate                                                                                                                          |
| -- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 30 | 🔴 `apps/backend/src/features/tasks/tasks.repository.ts:67-79` `getTasks` | Cross-user data leak via Drizzle `.where()` replace semantics. Rewrite as `const conditions = [eq(tasks.userId, userId), …]` then single `where(and(...conditions))`. | [coding-practice](../../llm/coding-practices.md#drizzle-one-whereand-per-query--never-call-where-multiple-times) |
| 31 | `apps/backend/src/features/labels/labels.repository.ts:62-71` `getLabels` | Silent filter loss (name/color filters ignored) — same `.where()` replace cause. Same fix shape as #30.                                                                          | same                                                                                                                             |
| 32 | repo-wide audit                                 | Grep all `*.repository.ts` for any other `query.where(...)` calls following a previous `query.where(...)`. Likely only the two above (per round-1 grep), but verify and fix any survivors. | same                                                                                                                             |

### Cluster B · ADR-mandated wiring (do SECOND)

| #  | Path                                                                | Fix                                                                                                                                                                                                                                                                                                       | Mandate                                                                                                            |
| -- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 26 | 📐 create `apps/backend/src/utils/safe.ts`                          | `safe<T, E = Error>(p: Promise<T>): Promise<Result<T, E>>` returning `{ ok: true; data: T } \| { ok: false; error: E }` discriminated union. Always rethrow unknown error classes explicitly at the call site.                                                                                          | [ADR-0013](../../stable/_shared/adr/0013-safe-utility-for-error-inspection.md)                                     |
| 27 | 📐 create `apps/backend/src/utils/errors/domain-error.ts`           | `DomainError` abstract base + 7 subclasses (`EntityNotFoundError`, `BusinessRuleViolationError`, `ConflictError`, `UnauthorizedDomainError`, `RepositoryValidationError`, etc. — final list at implementation time; pin in code review). Define `DOMAIN_ERROR_MAP` registry: `Map<Class<DomainError>, { status, verboseCode }>`. | [ADR-0012](../../stable/_shared/adr/0012-error-propagation-pattern.md)                                             |
| 27 | 📐 rewrite `errorHandler` in `apps/backend/src/utils/errors/http-errors.ts` | Dispatch via `DOMAIN_ERROR_MAP` registry. Fall through to AppError handling for HTTP-flavoured errors. Generic 500 for anything unknown.                                                                                                                                                                  | [ADR-0012](../../stable/_shared/adr/0012-error-propagation-pattern.md)                                             |
| 22 | 📐 `AppError` constructor + handler + all call sites                | Rename `hideToClient` → `showToClient`. Flip default to `false`. Update flag semantics in handler (was: dev shows custom · prod hides UNLESS `hideToClient=false`; now: dev shows custom · prod hides UNLESS `showToClient=true`). Audit + update every `new AppError({...})` call site.                  | [ADR-0012](../../stable/_shared/adr/0012-error-propagation-pattern.md)                                             |
| 21 | 📐 wire `RepositoryValidationError` in every `*.repository.ts`      | Where code currently calls `selectXSchema.safeParse(row)` and checks `!parsed.success`, throw `new RepositoryValidationError('…', { input: row, issues: parsed.error.issues })`. **Critical**: pass the failing **input** (`row` / `task[0]`), NOT `parsed.data` — `parsed.data` is `undefined` when `safeParse` fails. | [ADR-0010](../../stable/_shared/adr/0010-repository-validates-on-exit.md) + [ADR-0012](../../stable/_shared/adr/0012-error-propagation-pattern.md) |
| 25 | 📐 absorbed by #21                                                   | Same fix as #21 (the existing `parsed.data` bug is the same root cause).                                                                                                                                                                                                                                  | same                                                                                                               |
| 28 | 📐 `apps/backend/src/utils/errors/http-errors.ts`                   | Replace `console.error(…)` in `errorHandler` with `logger.error('error_handler_unhandled', { err })` (structured call per ADR-0015 logging discipline).                                                                                                                                                  | [ADR-0012](../../stable/_shared/adr/0012-error-propagation-pattern.md) + [ADR-0015](../../stable/_shared/adr/0015-request-id-via-asyncLocalStorage.md) |
| 36 | 📐 create `apps/backend/src/utils/auth-context.ts`                  | Export `AUTH_CTX_KEYS = { user: 'user', session: 'session' } as const`. Type the Hono `Variables` generic so `c.get(AUTH_CTX_KEYS.user)` is typed. Refactor `auth.ts` middleware + every consumer (controllers, anything calling `c.get('user')` / `c.get('session')`) to use the constants.              | Coding-practice rule (Item 15)                                                                                     |
| 29 | 📐 refresh `docs/stable/backend/error-handling.md`                  | Currently still documents superseded pattern β (try/catch with `EndpointError` everywhere). Rewrite to match ADR-0012 + ADR-0013. Should reference ADRs by link, not duplicate content.                                                                                                                  | [ADR-0012](../../stable/_shared/adr/0012-error-propagation-pattern.md)                                             |
| 18 | 📐 `apps/backend/src/env.ts`                                        | Add `'log'` to `LOG_LEVEL` enum. Logger supports the level but env can't currently set it.                                                                                                                                                                                                              | [ADR-0015](../../stable/_shared/adr/0015-request-id-via-asyncLocalStorage.md)                                      |

### Cluster C · Mechanical cleanup (do LAST)

| #  | Path:line                                                                                                                                                                                                                                                                                                                  | Fix                                                                                                                                                                                                                                                                                                                                                                                                       |
| -- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 19 | 🧹 `apps/backend/src/utils/create-app.ts:36`                                                                                                                                                                                                                                                                            | `popoulateRouter` typo + deprecated marker. If still called anywhere, rename in place and update consumers. If unused, delete.                                                                                                                                                                                                                                                                            |
| 20 | 🧹 `apps/backend/src/utils/errors/endpoint-error.ts`                                                                                                                                                                                                                                                                    | `EndpointError` JSDoc example uses `'INTERAL'` — typo. Fix to `'INTERNAL_SERVER_ERROR'`.                                                                                                                                                                                                                                                                                                                  |
| 23 | 🧹 `apps/backend/src/utils/configure-open-api.ts`                                                                                                                                                                                                                                                                       | Hardcoded title `'Hono API'`. Read from `package.json` (`name` + `version`).                                                                                                                                                                                                                                                                                                                              |
| 24 | 🧹 `apps/backend/src/utils/mapping.ts` `nullsToUndefined`                                                                                                                                                                                                                                                               | Constructor-name check is fragile across realms / proxies. Two acceptable fixes: (1) replace with `Symbol.toStringTag` or `typeof` checks; (2) accept the fragility and document it inline. Pick at code-review time — leaning (1).                                                                                                                                                                       |
| 33 | 🧹 `apps/backend/src/features/labels/labels.routes.ts:37,76,98`                                                                                                                                                                                                                                                         | Rename `:id` → `:labelId`. Update Zod path schemas + controller call sites accordingly.                                                                                                                                                                                                                                                                                                                   |
| 34 | 🧹 `apps/backend/src/features/reminders/reminders.routes.ts:36,101,+`                                                                                                                                                                                                                                                   | Rename `:id` → `:reminderId`. Update Zod path schemas + controller call sites. Grep for any other instances missed by the line numbers.                                                                                                                                                                                                                                                                   |
| 35 | 🧹 `apps/backend/src/features/tasks/tasks.service.ts` + interface                                                                                                                                                                                                                                                       | Rename `getTasksById` (plural typo) → `getTaskById` (singular, matches return cardinality per Item 12 rule). Update interface + controller call site.                                                                                                                                                                                                                                                     |

## Execution order

Recommended:

1. **A** (security #30 #31 #32) · one commit `fix(security): close cross-user data leak in tasks/labels repositories`.
2. **B1** (`safe.ts` #26 alone) · `feat: add safe() utility per ADR-0013`. Independent — no other code depends on it yet.
3. **B2** (`DomainError` + registry + handler rewrite, #27 + #28 together) · `refactor(errors): introduce DomainError taxonomy per ADR-0012`. Big-ish but indivisible.
4. **B3** (`showToClient` rename #22) · `refactor(errors): rename hideToClient → showToClient, flip default`. Touches many sites; isolate.
5. **B4** (`RepositoryValidationError` wiring #21 #25) · `fix(repo): wire RepositoryValidationError on safeParse failures`. Includes the `parsed.data` → failing input fix.
6. **B5** (`auth-context.ts` #36) · `refactor(auth): extract AUTH_CTX_KEYS constants per coding-practice`.
7. **B6** (doc refresh #29) · `docs(backend): refresh error-handling.md to match ADR-0012`. Pure-doc, last.
8. **B7** (env `LOG_LEVEL` #18) · `chore(env): add 'log' to LOG_LEVEL enum`. Tiny.
9. **C** (mechanical #19 #20 #23 #24 #33 #34 #35) · could be one commit `chore: backend cleanups` or several — user's call.

## Don'ts

- **Never auto-commit** — user commits manually. Period. ([feedback_pause_workflow memory](#))
- **Don't touch BetterAuth tables** — `users` · `sessions` · `accounts` · `verifications` schema columns are off-limits. ADR-0017 + glossary entry cover this.
- **Don't drop `users_projects`** — reserved scaffolding for future multi-user sharing. ADR-0020.
- **Don't add code snippets** to coding-practices entries — rule is behavior + intent only, no examples ([user rule](#)).
- **Don't reintroduce granular PATCH endpoints** (`PATCH /tasks/:id/status` etc.) during refactor — they were intentionally dropped per ADR-0014.
- **Don't run git commands without permission**. Show diffs; let user commit.

## After fix phase

When all fixes land:

1. Run **Phase Z · TS style grill round** — defer here is intentional. Real code shapes the decisions. ~10–12 items: casing, export style, import order, `??` vs `||`, `null` vs `undefined`, `unknown` vs `any`, `const` assertions, discriminator name, `readonly`, async iteration, module-level const vs class statics. (Full list in plan file.)
2. **Delete** plan file `~/.claude/plans/init-this-is-a-humble-nova.md` + this handoff + `backend-grill-agenda-2026-05-16.md`.
3. Consider **personal standards extraction** (future-todo in plan file) — only when next personal project starts.

## Open handoffs that can be cleaned up

These are still in `docs/handoffs/_shared/` but are stale or superseded:

- [`backend-grill-agenda-2026-05-16.md`](./backend-grill-agenda-2026-05-16.md) — superseded by this doc. Can be deleted after this handoff is read once.
- [`design-system-brainstorm-2026-05-14.md`](./design-system-brainstorm-2026-05-14.md) — superseded by `design-phase-complete-2026-05-14.md`. Can be deleted.
- [`design-phase-complete-2026-05-14.md`](./design-phase-complete-2026-05-14.md) — still relevant if frontend work resumes; keep for now.
- [`phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md) — phase-1 dep upgrades record. Keep if anything still pending; otherwise delete.

User to decide on cleanup ordering — none are urgent.

## Plan file status

`~/.claude/plans/init-this-is-a-humble-nova.md` — all items 1–17 + TS style pre-locks ticked. Two open future-todos (TS style grill round + personal standards extraction). Plan stays until fix phase + Phase Z complete, then deletes with this handoff.

## Session memory (auto-loads in next chat)

These are already saved to auto-memory and re-inject in the next chat — listed here for visibility only:

- Pause-workflow = handoff doc, no commits (`feedback_pause_workflow`).
- No tailwind palette names — describe by hex + hue (`feedback_no_tailwind_names`).
- Vue/Nuxt leaning for next frontend — not in repo docs (`project_next_frontend`).

No more memory writes expected from this round.
