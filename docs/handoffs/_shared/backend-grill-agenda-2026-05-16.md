---
created: 2026-05-16
updated: 2026-05-17
summary: Backend grill-with-me round 1 in progress. Items 1 + 2 + hydrated-read shape + architectural pattern questions resolved. ADRs 0008–0011 + Backend coding-practices entries + glossary additions landed. Resume at Item 3 (error handling).
---

# Handoff — backend grill round 1 paused (2026-05-16)

Pick up tomorrow from here. **Round 1 paused mid-agenda.** Architectural layer model + cross-feature contract + repo-validation rules are locked. Open question: hydrated-read method shape (`getTask` vs `getTaskWithLabels` combinatorial problem).

## Done this round (locked, in repo)

### New ADRs

- [`adr/0008-backend-layer-model.md`](../../stable/_shared/adr/0008-backend-layer-model.md) — 4-layer model (controller / service / repository / integration client) + role definitions.
- [`adr/0009-cross-feature-call-rules.md`](../../stable/_shared/adr/0009-cross-feature-call-rules.md) — cross-feature reads → repo; writes/operations → service; DAG constraint.
- [`adr/0010-repository-validates-on-exit.md`](../../stable/_shared/adr/0010-repository-validates-on-exit.md) — repos Zod-validate exit data; throw `RepositoryValidationError`.
- [`adr/0011-hydrated-read-interface.md`](../../stable/_shared/adr/0011-hydrated-read-interface.md) — bare + hydrated method pair; Drizzle relational queries (v1 syntax now; v2 migration tracked); leftJoin reserved for "filter root by related value".
- [`adr/0012-error-propagation-pattern.md`](../../stable/_shared/adr/0012-error-propagation-pattern.md) — pattern α: service throws `DomainError` subclasses · global handler maps via typed registry · no try/catch in controllers · `showToClient` flag (renamed from `hideToClient`, polarity flipped, default false) · `EndpointError<TRoute>` retained as opt-in escape hatch only.
- [`adr/0013-safe-utility-for-error-inspection.md`](../../stable/_shared/adr/0013-safe-utility-for-error-inspection.md) — `safe()` helper at `utils/safe.ts` returning `Result<T, E>` discriminated union (object flavor, not tuple) for opt-in error inspection at recovery sites.
- [`adr/0014-endpoint-shape-rules.md`](../../stable/_shared/adr/0014-endpoint-shape-rules.md) — endpoint shape pattern γ: unified PATCH · dedicated POST /action for business operations with side effects · dedicated GET /hydrated for hydrated reads. Drops the 4 granular PATCH endpoints from tasks.
- [`adr/0015-request-id-via-asyncLocalStorage.md`](../../stable/_shared/adr/0015-request-id-via-asyncLocalStorage.md) — every request tagged with `requestId` carried via `AsyncLocalStorage`; logger auto-includes it on every line without thread-through of signatures.

### `docs/llm/coding-practices.md`

Backend section now populated with:

- Layer responsibilities (controller / service / repository / integration client)
- Controller calls exactly one service method per request (additive-read exception)
- Pass-through service methods OK within a feature
- Cross-feature reads → repo; cross-feature writes → service
- Repository validates data on exit
- Repository may JOIN for natural hydrated read shape
- Hydrated-read interface: `findX` + `findXHydrated` pair
- Drizzle relations: v1 syntax now, v2 migration tracked
- Error propagation: throw + bubble; no try/catch in controllers; `DomainError` taxonomy + registry
- Service / repository never throw `AppError`
- `EndpointError<TRoute>` is an opt-in escape hatch only
- `showToClient` flag controls custom-message exposure in production
- `safe()` for opt-in error inspection
- Logger singleton everywhere except pre-env boot

Rule-entry format updated — no code snippets, just behavior + intent + cross-links (per user rule).

### `docs/stable/_shared/glossary.md`

New entries: **Controller (layer)** · **Service (layer)** · **Repository (layer)** · **Integration client (layer)** · **Data source** · **Deep module**. Each with avoid-aliases list + cross-links to relevant ADRs / coding-practices.

## Resolved agenda items

- ✅ **Item 1** · Service layer purpose — service layer kept, can be pass-through within feature; recorded in ADR-0008 + coding-practices.
- ✅ **Item 2** · Repository "as-is" rule vs Zod-parse — locked Camp 2 (validate at exit); recorded in ADR-0010 + coding-practices.
- ✅ Cross-cutting: cross-feature call rules — locked; recorded in ADR-0009 + coding-practices.
- ✅ Cross-cutting: integration client layer — convention recorded ahead of first use; coding-practices + glossary entries.

## Next session

Items 1 + 2 + 3 + hydrated-read shape all resolved (ADRs 0008–0013). **Resume at Item 4 · Granular endpoints vs unified update.**

Outstanding architectural items (4 + 5 in the original list):
- **Item 4** · Granular endpoints vs unified update (`updateTask` + 4 granular siblings vs single `PATCH /tasks/:id`).
- **Item 5** · Logging discipline — partially covered by ADR-0012 (logger singleton in handler · `console.*` boot-only). Item 5 may collapse into a coding-practices follow-up rather than a separate grill round.

## Outstanding agenda (from original 25)

Items NOT yet grilled:

### Architectural / behavioral

- ~~**Item 3** · Error-handling pattern~~ → resolved 2026-05-17. See ADR-0012 + ADR-0013.
- **Item 4** · Granular endpoints vs unified update — `updateTask` plus `updateTaskStatus`, `updateTaskPriority`, `updateTaskRecurringInterval`, `updateTaskIsRecurring`. Pick canonical pattern.
- **Item 5** · Logging discipline — logger singleton vs `console`. Where MUST logger be used; where is console OK.

### Schema-level

- **Item 6** · BetterAuth `text` PKs vs app-feature `uuid` PKs — pin the boundary so a future contributor doesn't "harmonize".
- **Item 7** · `tasks.projectId SET NULL` on project delete — non-obvious deliberate orphaning. ADR worthy.
- **Item 8** · `updatedAt` presence inconsistency (tasks ✓, users_projects ✓; missing on projects/labels/reminders).
- **Item 9** · DB-level CHECK constraints for enums.
- **Item 10** · Drizzle query style (chained vs functional / mutating vs immutable).

### Code conventions

- **Item 11** · Route param naming `:taskId` vs `:id`.
- **Item 12** · `getTasksById` (plural) vs `getTaskById` (singular).
- **Item 13** · Service method naming pattern (granular verbs vs domain verbs).
- **Item 14** · `task_labels` Zod schema uses `.pick()` while others use `.omit()`.
- **Item 15** · Auth context keys hardcoded (`'user'`, `'session'`); rule should be exported `const`s.

### Schema / state housekeeping

- **Item 16** · `users_projects` table exists but unused — update glossary entry.
- **Item 17** · `verifications.createdAt`/`updatedAt` nullable — BetterAuth internal; document off-limits.

### Bugs / typos / dead code (no docs needed, separate cleanup commit)

- **18** · `env.LOG_LEVEL` missing `'log'` — now mandated by ADR-0012 (logger discipline).
- **19** · `popoulateRouter` typo + deprecated (`apps/backend/src/utils/create-app.ts:36`).
- **20** · `EndpointError` JSDoc example `'INTERAL'` typo.
- **21** · `RepositoryValidationError` defined but never thrown. Wiring mandated by ADR-0010 + ADR-0012; pass actual offending input + `parsed.error.issues`, not `parsed.data` (which is `undefined` when `safeParse` fails).
- **22** · `hideToClient` → rename `showToClient`, flip default to `false`, update all call sites + `AppError` constructor + handler logic. Mandated by ADR-0012.
- **23** · `utils/configure-open-api.ts` hardcoded "Hono API" title.
- **24** · `nullsToUndefined` fragile constructor-name check (`apps/backend/src/utils/mapping.ts`).
- **25** · `repo.safeParse` error path passes `parsed.data` (undefined) instead of failing input — addressed as part of item 21's wiring.
- **26** · Create `apps/backend/src/utils/safe.ts` with `Result<T, E>` discriminated union per ADR-0013.
- **27** · Create `DomainError` base + 7 subclasses + `DOMAIN_ERROR_MAP` registry per ADR-0012. Update `errorHandler` to dispatch via registry.
- **28** · Replace `console.error` in `errorHandler` with `logger.error` per ADR-0012.
- **29** · Refresh `docs/stable/backend/error-handling.md` to match ADR-0012 (currently still documents pattern β).
- **30 · 🔴 SECURITY** · `apps/backend/src/features/tasks/tasks.repository.ts:67-79` `getTasks` — cross-user data leak via Drizzle `.where()` replace semantics. Rewrite as conditions array + single `where(and(...))`. Per [Drizzle coding-practice](../../llm/coding-practices.md#backend-hono--drizzle--zod).
- **31** · `apps/backend/src/features/labels/labels.repository.ts:62-71` `getLabels` — silent filter loss (name/color filters ignored). Same fix pattern.
- **32** · Audit all other repository files for `query.where(...)` patterns without `let query =` reassignment. Likely only the two above per the grep, but verify before closing.
- **33** · `apps/backend/src/features/labels/labels.routes.ts` — rename `:id` → `:labelId` on lines 37, 76, 98. Update Zod schemas + controller accordingly.
- **34** · `apps/backend/src/features/reminders/reminders.routes.ts` — rename `:id` → `:reminderId` on lines 36, 101, plus any other instances. Update Zod schemas + controller accordingly.
- **35** · `apps/backend/src/features/tasks/tasks.service.ts` — rename `getTasksById` (plural) to `getTaskById` (singular) in interface + impl. Update controller call site.
- **36** · Create `apps/backend/src/utils/auth-context.ts` exporting `AUTH_CTX_KEYS = { user: 'user', session: 'session' } as const`. Refactor `auth.ts` middleware + all consumers (controllers, etc.) to use `AUTH_CTX_KEYS.user` / `AUTH_CTX_KEYS.session` instead of inline strings.

## Resume checklist

1. Read this handoff.
2. Open the **deferred** section above — hydrated-read method shape.
3. Discuss A/B/C/D. Lock decision. Record in coding-practices + maybe ADR.
4. Proceed to **Item 3** · error-handling pattern.
5. Keep ticking down the outstanding list.
6. When the full round wraps: delete the plan file at `~/.claude/plans/init-this-is-a-humble-nova.md` + this handoff; surface bugs 18–25 to user for a separate `chore: backend cleanups` commit.

## Plan file status

`~/.claude/plans/init-this-is-a-humble-nova.md` still holds the agenda. Mark items 1, 2 + the architectural rules as done; keep the rest. Per pause-workflow convention, plan stays until the entire round wraps.

## Open handoffs (all uncommitted)

- [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md) — phase-1 dep upgrades.
- [`./design-system-brainstorm-2026-05-14.md`](./design-system-brainstorm-2026-05-14.md) — **superseded** by design-phase-complete; recommend delete next commit cycle.
- [`./design-phase-complete-2026-05-14.md`](./design-phase-complete-2026-05-14.md) — full v1 design wrap.
- **(this file)** — backend grill round 1 paused mid-round.

## Session memory (not in repo)

- Pause-workflow: write handoff, never auto-commit.
- No tailwind palette names in design docs.
- Vue/Nuxt leaning for next frontend — not in repo docs.
- User commits manually.
