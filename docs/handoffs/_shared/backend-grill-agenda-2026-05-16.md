---
created: 2026-05-16
updated: 2026-05-16
summary: Pause point before the backend grill-with-me round starts. Audit already done (3 Explore agents · ~30 candidates surfaced · ordered agenda written). Resume by running the agenda one item at a time.
---

# Handoff — backend grill agenda ready, round not yet started (2026-05-16)

Pick up tomorrow from here. **Audit done · grilling not yet started.** Open the grill agenda below + start at item 1.

## Done in this session

- Three Explore agents audited the backend in parallel:
  - **Tasks feature deep-dive** (compared against labels) — naming, function form, error handling, zod, drizzle patterns, layered-architecture adherence, async/await, comments, undocumented decisions.
  - **Cross-cutting concerns** — every file under `apps/backend/src/utils/`, `src/types/`, `src/db/`, `src/app.ts`, `src/index.ts`.
  - **Schema-level audit** — every `*.db.ts` + `drizzle.config.ts`. Per-table column inventory, FK cascade rules, zod schema generation, naming conventions, cross-table inconsistencies.
- Findings consolidated into **an ordered grill agenda of 25 items** (see below).
- Behavior added in earlier session: Grill-with-me now covers code-style + naming + 4 grilling tactics (challenge-against-glossary · sharpen-fuzzy · concrete-scenarios · cross-reference-code). Documented in [`docs/llm/behavior.md`](../../llm/behavior.md).

## Resume protocol

1. Read this handoff first.
2. Optionally re-read [`docs/llm/behavior.md` § Grill-with-me](../../llm/behavior.md#grill-with-me--terminology-discipline) to reload the discipline.
3. Start at **agenda item 1** below. Grill one item at a time, no question cap, until perfectly clear.
4. Record outputs in the right channel: 🧭 glossary · 📐 coding-practices · 🏛 new ADR · 🐞 pending-fixes list.
5. Tick items off in this doc as they're closed (move them under "Resolved" with a one-line summary + the doc that captured the decision).

## Grill agenda

Sequence is roughly impact-first. User can reorder during the round.

### Architectural / behavioral (most impact · likely ADRs)

1. **Service layer purpose** 🏛 — every service method is a pass-through to the repository (zero business logic). Keep / repurpose / remove? If kept, what belongs there?
2. **Repository "return data as-is" rule vs current Zod-parse behavior** 🏛 — `docs/stable/backend/architecture.md` says repositories don't transform; current code parses every row through `selectXSchema.safeParse()` (a transform). Reconcile.
3. **Error-handling pattern · no try/catch anywhere** 📐 — all errors propagate to the global handler. Document as a coding-practice including exceptions.
4. **Granular endpoints vs unified update** 🏛 — `tasks` has `updateTask` PLUS `updateTaskStatus`, `updateTaskPriority`, `updateTaskRecurringInterval`, `updateTaskIsRecurring`. Labels uses `assignLabelToTask` / `removeLabelFromTask` instead. Pick canonical pattern.
5. **Logging discipline** 📐 — logger singleton exists; `errorHandler` uses `console.error`; `env.ts` uses `console.log` for the env-loaded table. Rule: where MUST logger be used, where is console OK (boot-time pre-env? CLI scripts?).

### Schema-level decisions (medium impact)

6. **BetterAuth `text` PKs vs app-feature `uuid` PKs** 🏛 — auth tables use `text` IDs (BetterAuth requirement); everything else uses `uuid` with `defaultRandom()`. Pin the boundary.
7. **`tasks.projectId` is `SET NULL` on project delete** 🏛 — non-obvious deliberate orphaning. ADR worthy.
8. **`updatedAt` presence inconsistency** 📐 / 🏛 — present on tasks + users_projects, missing on projects/labels/reminders. Three options: add to all owned tables · keep only where mutation is "meaningful" · accept inconsistency. Pick one + record rule.
9. **DB-level CHECK constraints for enums** 📐 — currently only at Drizzle/Zod app layer. Decide + pin.
10. **Drizzle query style** 📐 — current pattern: build a query, mutate it with `query.where(...)`. Alternative: functional chaining via `db.select().where(and(...))`. Pick canonical.

### Code conventions (lower stakes · high frequency)

11. **Route param naming · `:taskId` vs `:id`** 📐 / 🧭 — tasks routes use `:taskId`; labels' get-by-id uses `:id`. Pick canonical (presumably `:<entity>Id`).
12. **Naming inconsistency · `getTasksById` (plural) vs `getTaskById` (singular)** 🐞 / 🧭 — controller calls `getTasksById`; route schema uses `taskIdParamSchema` (singular). Typo or pattern?
13. **Service method naming pattern** 📐 / 🧭 — granular verbs (`updateTaskStatus`) vs domain verbs (`assignLabelToTask`). Pin canonical + when each applies.
14. **`task_labels` Zod schema uses `.pick()` while others use `.omit()`** 📐 — pick canonical for composite-PK tables.
15. **Auth context key strings (`'user'`, `'session'`)** 📐 — hardcoded everywhere. Rule: context keys defined as exported `const`s.

### Schema / state housekeeping

16. **`users_projects` table exists but unused** 🧭 — for future project sharing, deliberately deferred to v2+. Update Project glossary entry.
17. **`verifications.createdAt`/`updatedAt` nullable** 🧭 / 🐞 — BetterAuth internal. Document that auth tables are off-limits.

### Bugs / typos / dead code (no docs needed)

18. **`env.LOG_LEVEL` enum missing `'log'`** 🐞 — logger supports the level; env can't set it.
19. **`popoulateRouter` typo + deprecated** 🐞 — `apps/backend/src/utils/create-app.ts:36`. Remove or document as internal.
20. **`EndpointError` JSDoc example uses `'INTERAL'`** 🐞 — typo in `apps/backend/src/utils/errors/http-errors.ts`.
21. **`RepositoryValidationError` defined but never thrown** 🐞 — `apps/backend/src/utils/errors/domain-errors.ts`. User flagged it again opening `apps/backend/src/features/tasks/tasks.repository.ts:120`. Decide: wire it in, or delete.
22. **`hideToClient` double-negative semantics** 📐 / 🐞 — confusing logic in `apps/backend/src/utils/errors/http-errors.ts`. Document or rename flag.
23. **`utils/configure-open-api.ts` hardcoded title "Hono API"** 🐞 — should come from `package.json`.
24. **`nullsToUndefined` constructor-name check** 🐞 — fragile across realms/proxies. `apps/backend/src/utils/mapping.ts`.
25. **`repo.safeParse` error path passes `parsed.data` (undefined) instead of the failing row** 🐞 — `apps/backend/src/features/*/repository.ts`. Likely a bug.

## Recording channels

- 🧭 **glossary** → edit `docs/stable/_shared/glossary.md`
- 📐 **coding-practices** → edit `docs/llm/coding-practices.md`
- 🏛 **new ADR** → create `docs/stable/_shared/adr/NNNN-<slug>.md` (next sequential, currently 0007 is the last). Pocock format + our frontmatter.
- 🐞 **pending fixes** → keep a short list (in the plan file or this handoff while grilling). At the end of the round, surface to the user for a `chore: backend cleanups` commit batch.

**No code snippets in coding-practices entries** (user rule: behaviors + decisions, not implementations).

## Open handoffs (for context · all uncommitted)

- [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md) — phase-1 dep upgrades. Still open. Suggested commits enumerated there.
- [`./design-system-brainstorm-2026-05-14.md`](./design-system-brainstorm-2026-05-14.md) — superseded by design-phase-complete. **Recommend deleting** on next commit cycle.
- [`./design-phase-complete-2026-05-14.md`](./design-phase-complete-2026-05-14.md) — full v1 design phase wrap-up. Still open.
- **(this file)** — backend grill agenda, not yet started.

Order of commits will likely be: phase-1 deps → design docs → grill round outputs (after this round runs).

## State to keep / context

- Plan file at `~/.claude/plans/init-this-is-a-humble-nova.md` still holds the agenda (same content as above, in plan-doc format). **Kept** because the work isn't done; per convention, delete when the round wraps.
- Visual companion server: not needed for this round (no visual content).
- Memory state preserved: pause-workflow, no-tailwind-names, project-next-frontend-leaning-vue.

## Resume checklist (tomorrow)

1. Open this handoff + the plan file (`~/.claude/plans/init-this-is-a-humble-nova.md`).
2. (Optional) re-read `docs/llm/behavior.md` § Grill-with-me to reload discipline.
3. Start at **item 1 · Service layer purpose**.
4. Tick off items here as they close; record outputs in their channel.
5. At the end of the round: write the new ADRs, populate `coding-practices.md`, extend `glossary.md`, surface the pending-fixes list. Then delete this handoff + the plan file and ask user to commit the round's docs.
