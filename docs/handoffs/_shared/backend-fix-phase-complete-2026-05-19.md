---
created: 2026-05-19
updated: 2026-05-19
summary: Backend fix phase (round-1 grilling + Cluster A security + Cluster B ADR-mandated wiring + Cluster C mechanical cleanups) fully complete and committed. Phase Z (TS style grill round) is in progress — Topics 1 (casing) and 2 (export style + barrels + side-effect imports + extendZodWithOpenApi relocation) locked into coding-practices in commit `08a7b30 continue grilling session`. Topic 3 (import-order) deferred pending ESLint/Prettier/Husky config import (§1.5). This doc is the cold-boot brief — it lists the remaining backlog (Phase Z 4–11, phase-1 carry-forwards, controller error-throwing restructure, library-API drift audit, backend v1 design changes, Vue/Nuxt FE).
---

# Handoff — backend fix phase complete + Phase Z in progress (2026-05-19)

**Status**: backend fix phase fully complete *and committed* (Cluster A + Cluster B1–B7 + Cluster C, all merged on main via `7a4ea02` and predecessors). **Phase Z (TS style grill round) is in progress**: Topics 1 (casing) and 2 (export style — including barrels, side-effect imports, and the `extendZodWithOpenApi` relocation) are fully grilled and locked into [`docs/llm/coding-practices.md`](../../llm/coding-practices.md); the doc edits were committed mid-session as `08a7b30 continue grilling session`. This handoff's own final edits (recording the pause + the new §1.5 ESLint-config-first ordering) sit uncommitted in the working tree — user commits manually per `feedback_pause_workflow`.

Phase Z Topic 3 (import-order grouping) is **deferred** until the ESLint/Prettier/Husky configs are brought in from the user's main project — see §1.5. The Topic-1+2 decisions imply ~6 mechanical renames + the `extendZodWithOpenApi` move; queued for execution, not done yet. After §1.5 lands, Topic 3 grill resumes; Topics 4–11 can be grilled in any order (no config dependency).

## How to resume cold

1. Read [`CLAUDE.md`](../../../CLAUDE.md) at the repo root.
2. Read [`docs/llm/behavior.md`](../../llm/behavior.md) end-to-end — the grill-protocol "Style" rule was tightened in commit `08a7b30` to require one question at a time (agent may list the agenda up front but grills only one sub-question at a time).
3. Read this handoff end-to-end.
4. Read the Topic-1 + Topic-2 entries in [`docs/llm/coding-practices.md`](../../llm/coding-practices.md) — committed in `08a7b30`: casing table · named-exports rule · barrels Pattern B · `extendZodWithOpenApi(z)` relocation · side-effect imports rule.
5. (Optional, if you're about to touch phase-1 leftovers) read [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md).
6. (Optional, if you're starting frontend work) read [`./design-phase-complete-2026-05-14.md`](./design-phase-complete-2026-05-14.md).
7. Verify git state: `git log --oneline | head -10` should show `08a7b30 continue grilling session` as HEAD on `main`. `git status` should show only this handoff file modified (or be clean if user has since committed this handoff edit).
8. Pick the next chunk from §Backlog — most likely §1.5 (ESLint/Prettier/Husky import) followed by Phase Z Topic 3.

## What's done (in repo, committed)

- **Round-1 grilling** — all 17 architectural/behavioral items locked in [ADRs 0008–0020](../../stable/_shared/adr/), backend coding-practice rules in [`docs/llm/coding-practices.md`](../../llm/coding-practices.md), and entries in [`docs/stable/_shared/glossary.md`](../../stable/_shared/glossary.md). 2 TypeScript pre-locks (arrow-default, `type` default) also recorded in coding-practices.
- **Fix-phase Cluster A** (security) — committed (`db05afe`).
- **Fix-phase Cluster B1–B7** (ADR-mandated wiring) — committed (`e54fe04 · d03ef51 · f165bc5 · 62c289f · 97d36dc`).
- **Fix-phase Cluster C** (mechanical cleanups #19 · #20 · #23 · #24 · #33 · #34 · #35 + `deleteReminder` alignment) — committed (`7a4ea02`).
- **Phase Z Topic 1 (casing) + Topic 2 (export style, barrels, side-effect imports, `extendZodWithOpenApi` relocation) + behavior.md grill-protocol tweak** — committed mid-session (`08a7b30 continue grilling session`). The commit also includes user's three exploratory edits made independently of the grill flow: (1) `apps/backend/src/features/projects/projects.types.ts` had its `extendZodWithOpenApi(z)` call + import **commented out** (one of the 4 locations slated for the relocation; the other 3 — `labels.types.ts` / `reminders.types.ts` / `tasks.types.ts` — still have the live calls, and the commented form in `projects.types.ts` should be deleted entirely rather than left commented when the relocation lands); (2) `apps/react19/package.json` added a `build:report` script (currently identical to `build` — placeholder, likely for a future bundle-visualizer plugin); (3) the root `tsconfig.json` got an `ignoreDeprecations: "6.0"` shim with a `// TS6: baseUrl deprecated; remove baseUrl + adapt paths in phase 2 before TS7` comment — note this is the **root** tsconfig, distinct from `apps/backend/tsconfig.json` (which also still has the same shim, tracked in §2 phase-1 carry-forwards).

Per-commit detail and the "locked decisions" table previously lived in the now-deleted `backend-grill-round1-complete-2026-05-18.md`. The ADRs + coding-practices + glossary are the source of truth for those decisions; the git log is the source of truth for the per-commit narrative.

## What's uncommitted (this session)

Only this handoff file (`docs/handoffs/_shared/backend-fix-phase-complete-2026-05-19.md`). Edits since the `08a7b30` commit: rewrote Status, How-to-resume, What's done, What's uncommitted, and §1 / §1.5 of the backlog to reflect Phase Z progress and the new ESLint-config-first ordering of remaining work. No code touched. `bun --cwd apps/backend run build` was not re-run (nothing to verify).

No suggested commit message — small documentation-only delta; commit at user's discretion alongside any further notes.

## Backlog (priority order)

### 1 · Phase Z · TS style grill round (in progress)

**Status**: Topics 1 and 2 fully grilled + locked into [`docs/llm/coding-practices.md`](../../llm/coding-practices.md) (`updated: 2026-05-19`). Topic 3 (import order) deferred pending the ESLint/Prettier/Husky config import — see §1.5 below. Topics 4–11 still queued.

**Locked this session (2026-05-19)**:

- **Topic 1 · Casing** — single table in coding-practices covers every identifier kind: variables/functions/methods `camelCase`; types/interfaces/classes `PascalCase`; module-level frozen data consts (`as const` arrays, lookup tables, primitive literals, `Object.freeze({...})` maps, `as const satisfies …` registries) `SCREAMING_SNAKE_CASE`; Zod schemas `camelCase` + `Schema` suffix (no PascalCase variant); files / dirs `kebab-case` unconditionally; route URL segments `kebab-case`; route path params + query keys `camelCase`; DB tables `snake_case` plural; DB columns Postgres `snake_case` → Drizzle TS `camelCase`; env vars `SCREAMING_SNAKE_CASE`; domain enum string literal members `snake_case` default (single-word lowercase reads as snake_case-of-length-one; per-field deviation documented at declaration). Cross-cutting standards (HTTP verbose codes, etc.) keep their well-known convention. Linter enforcement via `@typescript-eslint/naming-convention` deferred to §1.5.

- **Topic 2 · Export style** — locked as a cluster:
  - **Q2.1**: named exports default; `export default` only when an external API mandates it (Bun's `{ port, fetch }`). Mechanical renames pending — see "Mechanical renames" below.
  - **Q2.2 (barrels)** — Pattern B: public-API barrels only (the files referenced from `package.json` `exports`); internal-only barrels forbidden. Allowed barrel sources: `*.db.ts` + `*.types.ts`; server-only modules (`*.routes.ts` / `*.controller.ts` / `*.service.ts` / `*.repository.ts`) forbidden as barrel sources. Re-export form: explicit named lists, `export *` banned; types via `export type { … }`. Internal code uses deep paths, never own barrel — enforce via `import/no-restricted-paths` once ESLint lands. External consumers go through the `package.json` `exports` map only; deep-pathing into `dist/**` or `src/**` from outside the package forbidden.
  - **Bonus · `extendZodWithOpenApi(z)` relocation** — registration moves from the 4 `*.types.ts` files (where `.openapi()` is never called) to a single call inside `createApp()` in `apps/backend/src/utils/create-app.ts` (before any route is mounted). Prototype mutation is retroactive — schemas constructed before the call still acquire `.openapi()`. Side benefit: `*.types.ts` becomes pure Zod and joins the FE-safe import graph, so widening the barrel to also re-export from `*.types.ts` is bundle-safe (`@hono/zod-openapi` stays out of FE).
  - **Q2.5 · Side-effect imports / top-level side-effecting calls** — `A2`: side-effect-only `import './x'` banned outside the per-app entry, except bundler-mandated CSS/asset imports anywhere. `B2`: top-level side-effecting calls banned in feature/utility modules; allowed in clearly-marked boot modules (`env.ts` is the only example today; mark with a top-of-file comment).
  - **Schema-sharing future** — verified bundle scan (see §2 carry-forward) shows current Pattern B leaks only `drizzle-zod` runtime + Zod (drizzle ORM + pg-core + postgres driver + BetterAuth all tree-shaken out). Documented Option 5 codegen mirror as the deferred restructure when scale warrants.

- **Sub-decision · grill protocol** — `docs/llm/behavior.md` "Grill-with-me · Style" updated (2026-05-19) to enforce **one question at a time**: agent may list the agenda for a topic up front so the user sees what's coming, but only one sub-question is being grilled at any moment; never expect the user to answer a multi-question batch in any order.

**Mechanical renames + small rewrites queued by Phase Z decisions (Topics 1–2)** — batch into one or two PRs when execution resumes:

1. `apps/backend/src/utils/env.ts`: drop `export default env`; update the 7 consumer sites to `import { env } from '…'` (`hc.ts`, `index.ts`, `db/index.ts`, `utils/logger.ts`, `utils/create-app.ts`, `utils/auth.ts`, `utils/errors/http-errors.ts`).
2. `apps/backend/src/utils/env.ts`: add a top-of-file boot-module marker comment per the Q2.5/B2 rule (top-level `console.log`, `safeParse`, and `process.exit(1)` are intentional).
3. 4 router files (`labels.router.ts`, `projects.router.ts`, `reminders.router.ts`, `tasks.router.ts`): `export default xRouter` → `export const xRouter`; update `apps/backend/src/app.ts` imports accordingly.
4. `apps/backend/src/features/tasks/tasks.db.ts`: rename `statusOptions` / `priorityOptions` / `recurringOptions` → `STATUS_OPTIONS` / `PRIORITY_OPTIONS` / `RECURRING_OPTIONS` per the SCREAMING-SNAKE-for-frozen-data-consts rule. Update the consuming `tasks.types.ts`, `tasks.db.ts` column-`enum` references, and `apps/backend/src/features/tasks/index.ts` barrel re-export list.
5. `apps/backend/src/utils/status-codes.ts`: rename `verboseStatusCodes` → `VERBOSE_STATUS_CODES`. Update all consumers.
6. `extendZodWithOpenApi(z)` relocation: delete the call + the `@hono/zod-openapi` import from the 4 `*.types.ts` files (`labels.types.ts` / `reminders.types.ts` / `tasks.types.ts` still have the live calls; `projects.types.ts` already has them *commented out* in commit `08a7b30` — delete the commented lines entirely rather than leaving them as dead comments, and also drop the orphan `import {} from './projects.db'` line at the top of `projects.types.ts` since it imports no symbols). Add a single `extendZodWithOpenApi(z)` call inside `createApp()` (in `utils/create-app.ts`) with a `// must run before any route's .openapi() chain executes` comment.
7. Audit feature barrel re-exports for any newly-mismatched names after the SCREAMING-SNAKE renames; `apps/backend/src/features/tasks/index.ts` is the only barrel that re-exports option arrays today.

These can land *before* the ESLint/Prettier import — they don't depend on lint to be correct. They could also land *after*, which would let the new lint rules catch any missed sites.

**Topics still queued (4–11)**:

- 4 · `??` vs `||` policy.
- 5 · `null` vs `undefined` policy.
- 6 · `unknown` vs `any` (assume zero-`any`; lock the rule).
- 7 · `const` assertion vs explicit literal type.
- 8 · Discriminated-union discriminator name (`kind` vs `type`).
- 9 · `readonly` defaults on type members.
- 10 · Async iteration — `for...of` vs `.map(await)`.
- 11 · Module-level `const` vs class with static methods.

These don't depend on the ESLint config import — they can be grilled in any order. Topic 3 (import-order grouping) is the only one explicitly deferred pending §1.5.

### 1.5 · Bring in ESLint / Prettier / Husky configs from user's main project (do BEFORE Topic 3)

User has an existing ESLint + Prettier + Husky setup in another personal project and wants to import it here as the baseline before locking Topic 3 (import-order grouping). Reason: Topic 3 directly modifies the ESLint config (`import/order` rule), so iterating on import-order picks before the base config lands would force two passes.

Concrete next steps when work resumes:

1. User pastes / commits the base configs from the other project.
2. Reconcile with the existing root `eslint.config.mjs` (currently has the backend block + react19 block + tseslint-recommended + prettier).
3. Wire the rules already promised by locked Phase Z decisions:
   - `@typescript-eslint/naming-convention` — encode the casing table from Topic 1.
   - `import/no-restricted-paths` — backend zone forbidding `from: './apps/backend/src/features/*/index.ts` (see Q2.2f).
   - `no-restricted-imports` or equivalent — block `export *` re-exports (Q2.2c).
4. Run lint across the repo; surface drift; clean up.
5. *Then* grill Topic 3 with the live config visible.

Husky hooks: pick policy at import time (pre-commit lint, pre-push typecheck, etc.). No current expectations recorded.

### 2 · Phase-1 carry-forwards (verified pending against current code)

From [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md) — that handoff is still authoritative for the dep-bump detail; this list is the verified-still-pending subset:

- **`apps/backend/tsconfig.json`** still has `baseUrl: "./"` + `ignoreDeprecations: "6.0"` shim (lines 13–14). Must remove + adapt `paths` before TS 7.
- **Misplaced `extendZodWithOpenApi(z)`** present in 3 `*.types.ts` files live + 1 commented out: `labels.types.ts:2-3` · `reminders.types.ts:3-4` · `tasks.types.ts:3-4` (still live as of commit `08a7b30`); `projects.types.ts:3-4` (commented out in `08a7b30` — needs full deletion of the commented lines + the orphan `import {} from './projects.db'` line). Fix per Phase Z grill (coding-practices · `extendZodWithOpenApi(z)` rule, 2026-05-19): delete the 3 live calls + their `@hono/zod-openapi` imports + the commented variant, leaving those files on pure `zod/v4`. Add a single `extendZodWithOpenApi(z)` call inside `apps/backend/src/utils/create-app.ts`'s `createApp()` factory, before any route is mounted. Schemas in `*.db.ts` / `*.types.ts` are never touched by `.openapi()` (verified: zero call sites across all 4 features); only `*.routes.ts` calls `.openapi()` (6 chains). Prototype mutation is retroactive, so the boot-time registration covers all constructed schemas. Side benefit: `*.types.ts` becomes part of the FE-safe import graph (no longer drags `@hono/zod-openapi`).
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

Four superseded handoffs were deleted in the prior session that wrote this file (`backend-grill-agenda-2026-05-16.md` · `backend-grill-round1-complete-2026-05-18.md` · `design-system-brainstorm-2026-05-14.md` · `fix-phase-cluster-a-b-complete-2026-05-19.md`). Their decisions are preserved in ADRs / coding-practices / glossary / git log; nothing actionable was lost.

## Session memory (auto-loads in next chat)

- Pause-workflow = handoff doc, no commits (`feedback_pause_workflow`).
- No tailwind palette names — describe by hex + hue (`feedback_no_tailwind_names`).
- Vue/Nuxt leaning for next frontend — not in repo docs (`project_next_frontend`).
