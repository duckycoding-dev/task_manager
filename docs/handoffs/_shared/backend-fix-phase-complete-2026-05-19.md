---
created: 2026-05-19
updated: 2026-05-19
summary: Backend fix phase (round-1 grilling + Cluster A security + Cluster B ADR-mandated wiring + Cluster C mechanical cleanups) fully complete. Cluster C sits uncommitted in the working tree; user commits manually. This doc is the cold-boot brief — it lists the remaining backlog (Phase Z TS grills, phase-1 carry-forwards, controller error-throwing restructure, library-API drift audit, backend v1 design changes, Vue/Nuxt FE).
---

# Handoff — backend fix phase complete (2026-05-19)

**Status**: backend fix phase fully complete. Round-1 grilling (ADRs 0008–0020 + ~22 coding-practice rules + ~15 glossary entries) was committed before this session. Cluster A (security #30–#32) + Cluster B1–B7 (ADR-mandated wiring) were committed too. **Cluster C** (mechanical cleanups #19 · #20 · #23 · #24 · #33 · #34 · #35) plus the aligned `deleteReminder` fix landed in the working tree this session — **uncommitted**, user commits manually per `feedback_pause_workflow`.

After Cluster C commits, the backend is at the locked-decisions state from round-1. The remaining backlog is everything *not yet started*: TS style grill round, phase-1 carry-forwards, controller error-throwing restructure, a library-API drift audit (Drizzle / Zod / errors), and the design-mandated backend v1 changes.

## How to resume cold

1. Read [`CLAUDE.md`](../../../CLAUDE.md) at the repo root.
2. Read this handoff end-to-end.
3. (Optional, if you're about to touch phase-1 leftovers) read [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md).
4. (Optional, if you're starting frontend work) read [`./design-phase-complete-2026-05-14.md`](./design-phase-complete-2026-05-14.md).
5. Verify git state: `git log --oneline | head -10` should show the fix-phase commits (`97d36dc … db05afe`). `git status` should show the working-tree changes from Cluster C — 10 files modified, listed below.
6. Pick a chunk from §Backlog.

## What's done (in repo)

- **Round-1 grilling** — all 17 architectural/behavioral items locked in [ADRs 0008–0020](../../stable/_shared/adr/), backend coding-practice rules in [`docs/llm/coding-practices.md`](../../llm/coding-practices.md), and entries in [`docs/stable/_shared/glossary.md`](../../stable/_shared/glossary.md). 2 TypeScript pre-locks (arrow-default, `type` default) also recorded in coding-practices.
- **Fix-phase Cluster A** (security) — committed (`db05afe`).
- **Fix-phase Cluster B1–B7** (ADR-mandated wiring) — committed (`e54fe04 · d03ef51 · f165bc5 · 62c289f · 97d36dc`).

Per-commit detail and the "locked decisions" table previously lived in the now-deleted `backend-grill-round1-complete-2026-05-18.md`. The ADRs + coding-practices + glossary are the source of truth for those decisions; the git log is the source of truth for the per-commit narrative.

## What's uncommitted (this session)

Cluster C — 7 mechanical cleanups plus 1 follow-on alignment, 10 files modified in `apps/backend`:

| # | File(s) | Fix |
|---|---|---|
| 19 | `src/utils/create-app.ts` | Deleted misspelled deprecated `popoulateRouter` (zero callers). Cleaned up the now-unused `AppRouteHandler` / `AppRoutes` imports. |
| 20 | `src/utils/errors/http-errors.ts` | `EndpointError` JSDoc: `'INTERAL'` → `'INTERNAL_SERVER_ERROR'`, inline comment `"INTERNAL"` → `"INTERNAL_SERVER_ERROR"`, fixed dangling code-fence (` ``` ` was missing the JSDoc `*` prefix), corrected "corrisponding" → "corresponding". |
| 23 | `src/utils/configure-open-api.ts` | OpenAPI title hardcoded `'Hono API'` → `packageJSON.name`. |
| 24 | `src/utils/mapping.ts` | `nullsToUndefined`: fragile `obj.constructor.name === 'Object'` → `Object.getPrototypeOf(obj) === Object.prototype`. |
| 33 | `src/features/labels/{routes,controller}.ts` | Route param `:id` → `:labelId` for `getLabelById` / `updateLabel` / `deleteLabel`. `getLabelById` now uses `labelIdParamSchema`. Controller destructures `{ labelId }`. |
| 34 | `src/features/reminders/{routes,controller}.ts` | Route param `:id` → `:reminderId` for `getReminderById` / `updateReminder`. Added `reminderIdParamSchema` import. Controllers destructure `{ reminderId }`. |
| (34+) | `src/features/reminders/{routes,controller}.ts` `deleteReminder` | Out of original handoff scope but adjacent: route was `path: '/'` + `params: selectReminderSchema.pick({ id: true })` — schema unreachable at runtime. Aligned to the other two: `path: '/:reminderId'` + `reminderIdParamSchema` + controller destructures `{ reminderId }`. |
| 35 | `src/features/tasks/{service,controller}.ts` | `getTasksById` → `getTaskById` (singular — return cardinality is one, per Item 12 coding-practice). |

Verification at session end: `bun --cwd apps/backend run build` — TS clean. `grep` confirms zero residuals for `getTasksById`, `popoulateRouter`, `'INTERAL'`, bare `/:id` route params in `src/features/`.

Suggested commit message:

```
chore(backend): backend cleanups (#19 #20 #23 #24 #33 #34 #35)

- create-app.ts: remove deprecated `popoulateRouter` (zero callers).
- http-errors.ts JSDoc: 'INTERAL' → 'INTERNAL_SERVER_ERROR' + fix
  dangling code fence.
- configure-open-api.ts: OpenAPI title now reads packageJSON.name.
- mapping.ts nullsToUndefined: prototype-based plain-object guard
  instead of constructor.name string check.
- labels.routes.ts + reminders.routes.ts: route params entity-prefixed
  (:labelId, :reminderId) per Item 11 coding-practice. deleteReminder
  also moved from `path: '/'` + `.pick({ id: true })` to a proper
  `/:reminderId` with reminderIdParamSchema (was inconsistent with
  the rest + the schema was unreachable at runtime).
- tasks.service.ts: rename getTasksById → getTaskById per Item 12
  plurality rule.
```

## Backlog (priority order)

### 1 · Phase Z · TS style grill round

Deferred during round 1; ready now. ~10–12 short grills, each landing in glossary / coding-practices / new ADR. Two TS pre-locks (arrow-default, `type` default) already recorded.

Topics to grill:

- Casing rules (linter defaults vs explicit).
- Export style — named-only vs default; barrel files likely banned.
- Import order — external / internal / type-only.
- `??` vs `||` policy.
- `null` vs `undefined` policy.
- `unknown` vs `any` (likely zero-`any` rule).
- `const` assertion vs explicit literal type.
- Discriminated-union discriminator name (`kind` vs `type`).
- `readonly` defaults on type members.
- Async iteration — `for...of` vs `.map(await)`.
- Module-level `const` vs class with static methods.

### 2 · Phase-1 carry-forwards (verified pending against current code)

From [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md) — that handoff is still authoritative for the dep-bump detail; this list is the verified-still-pending subset:

- **`apps/backend/tsconfig.json`** still has `baseUrl: "./"` + `ignoreDeprecations: "6.0"` shim (lines 13–14). Must remove + adapt `paths` before TS 7.
- **Misplaced `extendZodWithOpenApi(z)`** present in all 4 `*.types.ts` files: `labels.types.ts:2-3` · `reminders.types.ts:3-4` · `projects.types.ts:3-4` · `tasks.types.ts:3-4`. Fix per Phase Z grill (coding-practices · `extendZodWithOpenApi(z)` rule, 2026-05-19): delete the 4 calls + their `@hono/zod-openapi` imports from `*.types.ts`, leaving those files on pure `zod/v4`. Add a single `extendZodWithOpenApi(z)` call inside `apps/backend/src/utils/create-app.ts`'s `createApp()` factory, before any route is mounted. Schemas in `*.db.ts` / `*.types.ts` are never touched by `.openapi()` (verified: zero call sites across all 4 features); only `*.routes.ts` calls `.openapi()` (6 chains). Prototype mutation is retroactive, so the boot-time registration covers all constructed schemas. Side benefit: `*.types.ts` becomes part of the FE-safe import graph (no longer drags `@hono/zod-openapi`).
- **Schema-sharing architecture** — `apps/react19/src/features/tasks/tasks.service.ts:1` already value-imports `selectTaskSchema` from `@task-manager/backend/tasks`. Bundle scan of `apps/react19/dist/assets/` (2026-05-19) shows Vite/Rollup tree-shakes drizzle-orm's `pg-core` builders entirely (0 hits for `pgTable` / `pg-core` / `postgres-js` / BetterAuth runtime), but **drizzle-zod runtime stays** (18 `drizzle` hits + `createSelectSchema` / `createInsertSchema` symbols in the tasks chunk). Hono / `@hono/zod-openapi` also stay out (barrel never re-exports from `*.types.ts`). Net cost today is drizzle-zod runtime + Zod, which is small. **Defer the restructure** until either (a) Vue/Nuxt FE adds more value-imports, (b) measured bundle has >50KB drizzle-zod chain weight, or (c) dev-mode HMR/cold-start becomes annoying (dev mode does **not** tree-shake — full chain loads). When triggered, take **Option 5** from the source-of-truth analysis: keep Drizzle as SoT, add a codegen build step that emits pure Zod schemas (no `drizzle-zod` runtime) into `packages/schemas/` or `apps/backend/dist/public-schemas/`, and re-point the FE imports there. **Never** hand-author a parallel Zod mirror — codegen avoids dual-source drift.
- **`apps/react19` + `packages/utils` deps** — runtime deps still on phase-1 versions. Low priority (Vue/Nuxt is the planned next FE).
- **ESLint warnings** — 2 backend unused `eslint-disable` directives (auto-fixable) + 8 react19 `react-refresh/only-export-components` on tanstack-router files (likely an override or config tweak).

### 3 · Controller error-throwing restructure (ADR-0012)

Bigger round. Touches every controller's `*ById` / `update*` / `delete*` method plus every service method that currently returns `undefined` on miss. Per [ADR-0012](../../stable/_shared/adr/0012-error-propagation-pattern.md): the service should throw `EntityNotFoundError` (or other `DomainError` subclass); the controller should not catch / not re-throw HTTP errors. End state: `EndpointError` import drops out of all 4 feature controllers.

Files in scope:

- `apps/backend/src/features/tasks/{service,controller}.ts`
- `apps/backend/src/features/projects/{service,controller}.ts`
- `apps/backend/src/features/labels/{service,controller}.ts`
- `apps/backend/src/features/reminders/{service,controller}.ts`

The global `errorHandler` in `apps/backend/src/utils/errors/http-errors.ts` already dispatches `DomainError` correctly via `DOMAIN_ERROR_MAP` — restructure work shouldn't need to touch the handler.

### 4 · Library-API drift audit (Drizzle / Zod / errors)

The project was originally scaffolded against older versions of Drizzle, Zod, and `@hono/zod-openapi`. Phase-1 dep upgrades bumped the versions (Zod 4.4.3 · Drizzle ORM 0.45.2 · `@hono/zod-openapi` 1.4.0 · `drizzle-zod` 0.8.3) but code shape was preserved mechanically. Patterns currently in the codebase may be:

- **Pre-Zod-4** — `safeParse` result shape, `z.prettifyError`, `extendZodWithOpenApi` registration boilerplate, `.openapi()` chain placement, error-issue shapes.
- **Pre-Drizzle-0.45** — `.where()` chaining semantics (ADR-0009/0010 + Cluster A addressed the worst case but residuals may remain), relational-query v1 vs v2 syntax, `$onUpdate` patterns, `pgEnum` vs app-side enum per [ADR-0019](../../stable/_shared/adr/0019-enum-validation-at-app-boundary-only.md).
- **Error-handling residuals** — search for `try/catch` in services (should bubble), `AppError` / `EndpointError` thrown from non-controller layers (per ADR-0012 these shouldn't exist outside the controller boundary, and the restructure round in §3 above will remove the controller ones too).

Output: coding-practice updates · ADRs (when load-bearing) · rewrite tickets. Best run after Phase Z (§1) so style is locked first, and folded into §3 where overlap exists. The redundant `extendZodWithOpenApi(z)` in §2 is a known sub-item of this audit.

### 5 · Backend v1 changes (from design phase)

Authoritative list: [`docs/stable/_shared/design/backend-changes-summary.md`](../../stable/_shared/design/backend-changes-summary.md). Large block — schema migrations + endpoint extensions. Recommended order from that doc:

1. **Soft-delete pattern** across `tasks`, `reminders`, `labels` — add `deletedAt: timestamp nullable` columns + partial indexes. List endpoints filter `deletedAt IS NULL` by default unless `includeDeleted=true`. Affects every list endpoint; do first.
2. **Drop `tasks.isRecurring`** column — replace reads with `recurringInterval !== 'none'`. Tracked in [ADR-0003](../../stable/_shared/adr/0003-drop-tasks-isrecurring.md).
3. **`projects.color`** → `NOT NULL` with hash-backfill migration.
4. **`labels.color`** → `NOT NULL` with hash-backfill migration.
5. **`GET /tasks` filter extensions** — multi-value (`projectId`, `status`, `priority`, `labelId`), range (`dueDateGte` / `dueDateLte`), text search (`q`), `includeDeleted` flag.
6. **`GET /reminders` filter extensions** — multi-value `taskId`, range (`remindAtGte` / `remindAtLte`), `includeDeleted` flag.
7. **`GET /labels`** — include `taskCount` in response shape; filter `deletedAt IS NULL` by default.
8. **`PATCH /labels/:labelId`** — accept `removeFromTasks: boolean` (two-mode delete per [ADR-0007](../../stable/_shared/adr/0007-two-mode-label-delete.md)).
9. **`DELETE /labels/:labelId`** — new permanent-delete endpoint; reject unless already soft-deleted.
10. **`GET /export/tasks`** + **`GET /export/preferences`** — new bundle endpoints.

Items deferred to v1.5 / v2 (same doc): `acknowledgedAt` on reminders · `position` on tasks · `task_events` / `comments` / `notifications` tables · server-side `users/preferences` · attachments · subtasks · sharing. Don't start these now.

### 6 · Vue/Nuxt frontend

User leans Vue/Nuxt for the next FE exploration. `apps/react19` is on minimal upkeep. Vue scaffolding has not been started. Will be its own multi-session plan informed by design specs 01–05 once §5 above lands. Cross-reference [`./design-phase-complete-2026-05-14.md`](./design-phase-complete-2026-05-14.md).

### 7 · Personal standards extraction (indefinite future)

Generic process/doc shape (CLAUDE.md hierarchy · grill-with-me protocol · docs convention · Pocock ADR format · glossary structure · coding-practices format · handoff lifecycle · behavior.md · pause-workflow rule) is portable. Backend ADRs 0008/0009/0012/0013/0014/0015/0018 + the two-mode-parent-delete pattern are portable. Extract only when the next personal project starts so the reuse pressure is real. **Not actionable now.**

## Don'ts

- **Never auto-commit** — user commits manually. Period. (`feedback_pause_workflow`)
- **Don't touch BetterAuth tables** — `users` · `sessions` · `accounts` · `verifications` schema columns are off-limits. ADR-0017 + glossary entry cover this.
- **Don't drop `users_projects`** — reserved scaffolding for future multi-user sharing. [ADR-0020](../../stable/_shared/adr/0020-users-projects-table-reserved-for-future-sharing.md).
- **Don't add code snippets** to coding-practices entries.
- **Don't reintroduce granular PATCH endpoints** (`PATCH /tasks/:id/status` etc.) — intentionally dropped per [ADR-0014](../../stable/_shared/adr/0014-endpoint-shape-rules.md).
- **Don't run git commands without permission**. Show diffs; let the user commit.

## Open handoffs in the repo

- [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md) — **keep**. Authoritative for the phase-1 dep-bump detail; 5 carry-forward items still pending (see §2 above).
- [`./design-phase-complete-2026-05-14.md`](./design-phase-complete-2026-05-14.md) — **keep**. FE entry point + design-phase wrap.
- (this file) — current state.

Four superseded handoffs were deleted in this session (`backend-grill-agenda-2026-05-16.md` · `backend-grill-round1-complete-2026-05-18.md` · `design-system-brainstorm-2026-05-14.md` · `fix-phase-cluster-a-b-complete-2026-05-19.md`). Their decisions are preserved in ADRs / coding-practices / glossary / git log; nothing actionable was lost.

## Session memory (auto-loads in next chat)

- Pause-workflow = handoff doc, no commits (`feedback_pause_workflow`).
- No tailwind palette names — describe by hex + hue (`feedback_no_tailwind_names`).
- Vue/Nuxt leaning for next frontend — not in repo docs (`project_next_frontend`).
