---
created: 2026-05-19
updated: 2026-07-03
summary: Backend v1 is COMPLETE AND COMMITTED (`0f464cd`). Fix phase (Clusters A+B+C), TS style grill round (11 topics), config-merge, ADR-0012 restructure, all backend v1 items, and the final-UI mockup consolidation are done. Schema-sharing resolved — deferred until the next FE starts; approach locked to spec-driven codegen from the emitted OpenAPI spec. ADR-0002 + ADR-0007 amended by the soft-delete/label-delete grill. Remaining backlog: phase-1 carry-forwards (minor chores), library-API drift audit (optional), next FE from scratch (stack decision kept out of repo docs), personal-standards extraction (indefinite).
---

# Handoff — backend v1 complete + committed, prep work wrapped (2026-07-03)

**Status**: ALL backend v1 items are **complete and committed** on `main` (HEAD `0f464cd chore: complete backend v1`). Working tree clean apart from doc/mockup additions. Final-UI mockups consolidated into `docs/stable/_shared/design/final-ui/`. No in-flight code work to recover. Untested at runtime — no test infrastructure exists yet (test-strategy decision never locked).

Recent commits in chronological order (oldest first within session windows):

- `21114cc` controller error-throwing restructure per [ADR-0012](../../stable/_shared/adr/0012-error-propagation-pattern.md).
- `9ab5e3b` 8 remaining TS-style grills locked + ESLint rules wired (`prefer-nullish-coalescing`, `no-explicit-any: error`, `prefer-readonly`, `no-floating-promises`, `no-misused-promises`, `no-extraneous-class`).
- `800f9a5` Phase Z mechanical renames + ESLint `naming-convention` + `no-default-export` rules + `extendZodWithOpenApi` moved to dedicated `utils/openapi-extension.ts` with side-effect import in `index.ts`.
- `af40186` v1 item 1 — soft-delete pattern across tasks/reminders/labels (deletedAt + partial indexes + repo filtering + `includeDeleted` query param). Migration `0002_clever_prism.sql`.
- `69b66aa` v1 item 2 — drop `tasks.isRecurring` column + remove `updateTaskIsRecurring` endpoint (also satisfies ADR-0014 no-granular-PATCH ban). Migration `0003_thick_the_professor.sql`.
- `f07c238` v1 items 3+4 — `projects.color` + `labels.color` NOT NULL with deterministic SQL `md5()` backfill. New `apps/backend/src/utils/color.ts` (curated 12-color palette + `colorFromName`). Migration `0004_safe_guardsmen.sql` hand-edited from drizzle-kit output to insert the backfill before `SET NOT NULL`.
- `0f464cd` v1 items 5–10 + restore endpoints + single-read `includeDeleted` (per-item detail in §Backlog item 5 below).

## How to resume cold

1. Read [`CLAUDE.md`](../../../CLAUDE.md) at the repo root.
2. Read [`docs/llm/behavior.md`](../../llm/behavior.md) — covers the grill-with-me protocol, anti-dangling-reference rule, frontmatter contract, git/destructive-action policy.
3. Read this handoff end-to-end.
4. Skim [`docs/llm/coding-practices.md`](../../llm/coding-practices.md) — the TS style rules are now all there. Most relevant if touching backend code: §"Casing rules", §"Named exports default …", §"Barrels: public-API only (Pattern B)", §"`extendZodWithOpenApi(z)` registered once via `utils/openapi-extension.ts`", §"Side-effect-only imports + boot-time top-level side effects", §"Import order", §"Nullish fallback uses `??`, never `||`", §"Zero `any` — use `unknown` and narrow", §"`null` at external boundaries, `undefined` internally", §"Async iteration".
5. (Optional, if touching phase-1 leftovers) read [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md).
6. (Optional, if starting frontend work) read [`./design-phase-complete-2026-05-14.md`](./design-phase-complete-2026-05-14.md).
7. Verify git state: `git log --oneline | head -10` should show `0f464cd chore: complete backend v1` (or newer) on `main`.
8. Run `bun --cwd apps/backend run db:migrate` if migrations `0002` / `0003` / `0004` haven't been applied locally yet (per `apps/backend/src/db/migrations/`). Then pick the next chunk from §Backlog.

## What's done (committed on `main`)

All of the below is merged — no uncommitted code work as of 2026-07-03.

- **Round-1 grilling** — all 17 architectural/behavioral items locked in [ADRs 0008–0020](../../stable/_shared/adr/), backend coding-practice rules in [`docs/llm/coding-practices.md`](../../llm/coding-practices.md), and entries in [`docs/stable/_shared/glossary.md`](../../stable/_shared/glossary.md). 2 TypeScript pre-locks (arrow-default, `type` default) also recorded in coding-practices.
- **Fix-phase Cluster A** (security) — committed (`db05afe`).
- **Fix-phase Cluster B1–B7** (ADR-mandated wiring) — committed (`e54fe04 · d03ef51 · f165bc5 · 62c289f · 97d36dc`).
- **Fix-phase Cluster C** (mechanical cleanups #19 · #20 · #23 · #24 · #33 · #34 · #35 + `deleteReminder` alignment) — committed (`7a4ea02`).
- **TS style grill round — all 11 topics complete + ESLint-enforced** (across `08a7b30` / `9ab5e3b` / `800f9a5`). All rules locked in coding-practices: §"Casing rules" · §"Named exports default …" · §"Barrels: public-API only (Pattern B)" · §"`extendZodWithOpenApi(z)` registered once via `utils/openapi-extension.ts`" · §"Side-effect-only imports + boot-time top-level side effects" · §"Import order" · §"Nullish fallback uses `??`, never `||`" · §"`null` at external boundaries, `undefined` internally" · §"Zero `any` — use `unknown` and narrow" · §"`as const` for literal narrowing" · §"Discriminator name: `kind` by default" · §"`readonly` selectively" · §"Async iteration — parallel by default" · §"Module-level `const`/`function` for utilities". Type-aware ESLint rules wired in per-app blocks (where `projectService` is enabled): `prefer-nullish-coalescing`, `no-explicit-any: error`, `prefer-readonly`, `no-floating-promises`, `no-misused-promises` (react19 block adds `checksVoidReturn.attributes: false` to permit async JSX handlers), `no-extraneous-class`. Syntactic rules: `naming-convention`, `no-default-export` (with carve-outs for `index.ts` Bun entry, `*.config.{ts,js,mjs,cjs}`, tanstack-router route files), `import-x/no-restricted-paths` (barrel discipline — backend internal code blocked from importing feature `index.ts` barrels), `no-restricted-syntax` (bans `export *` and side-effect-only imports outside entries + CSS/asset carve-out).

- **§1.5 ESLint / Prettier / Husky / Commitlint config-merge** (`32ddff0` / `a138b16` / `800f9a5`) — full `eslint.config.mjs` rewrite + `prettier.config.js` (printWidth 80) + `.prettierignore` (consolidated) + `commitlint.config.js` (type-enum `[feat, fix, chore, docs, style, refactor, revert, perf, test]`) + `.lintstagedrc.json` + `scripts/prepare-commit-msg.ts` + 3 husky hooks. Imported reference file `other_project_eslint.config.js` kept (in ignores) for manual comparison.

- **Phase Z mechanical renames** (`800f9a5`) — `env.ts` default→named (+ 8 consumer sites); 4 routers default→named (+ `app.ts`); `*Options` arrays → SCREAMING_SNAKE_CASE; `verboseStatusCodes` → `VERBOSE_STATUS_CODES`; `extendZodWithOpenApi` extracted to dedicated `utils/openapi-extension.ts` with side-effect-only import in `src/index.ts` (the side-effect import sorts to group 1 of `simple-import-sort` and always lands first, guaranteeing the prototype mutation runs before any `*.routes.ts` evaluates its inline `.openapi(...)` chains).

- **Controller error-throwing restructure (ADR-0012)** (`21114cc`) — 4 features × {service, controller}.ts. Services throw `EntityNotFoundError('<Entity>', id)` on miss; controllers dropped `EndpointError` import + all `if (!result) throw ...` blocks (~16 sites). Repos kept `Promise<X | undefined>` / `Promise<boolean>` shape — they're data-layer; finding nothing is data, not an error. Reminders `updateReminder` repo bug fixed along the way (was typed `Promise<Reminder>` without handling empty-result → would have thrown 500 on miss; now `Promise<Reminder | undefined>` with proper check).

- **Backend v1 items 1–4**:
  - **Item 1** (`af40186`) — Soft-delete across `tasks` / `reminders` / `labels`. `deletedAt: timestamp NULL` + partial indexes (`idx_<table>_user_active ON <table>(user_id) WHERE deleted_at IS NULL`). Migration `0002_clever_prism.sql`. Repos: `getX` filters `deletedAt IS NULL` unless `includeDeleted=true`; `getXById` / `updateX` always filter; `deleteX` now soft-delete (`UPDATE SET deleted_at = now()`). `projects.getProjectTasks` filters soft-deleted tasks; `tasks.getTaskReminders` filters both parent + child; `reminders.getRemindersByTaskId` filters. `getReminders` signature acquired a `filters` param; reminders routes wired the canonical `getRemindersQuerySchema` (was a `{ id: string }` placeholder). Side fix: `drizzle.config.ts` env import flipped to named.
  - **Item 2** (`69b66aa`) — Drop `tasks.isRecurring` per [ADR-0003](../../stable/_shared/adr/0003-drop-tasks-isrecurring.md). Migration `0003_thick_the_professor.sql`. Granular `updateTaskIsRecurring` endpoint removed end-to-end (also satisfies ADR-0014's ban on granular field-PATCH endpoints — two birds). FE `apps/react19/src/routes/tasks/create/index.tsx:56` dropped its `isRecurring: false` literal. Reads of "is recurring?" should use `recurringInterval !== 'none'`.
  - **Items 3 + 4** (`f07c238`) — `projects.color` + `labels.color` → `NOT NULL` with hash-backfill. New shared helper `apps/backend/src/utils/color.ts` (curated 12-color palette + `colorFromName(name)`). Zod insert schemas mark `color` optional via `.partial({ color: true })` so the repo-layer defaults via `colorFromName(name)` when client omits. Migration `0004_safe_guardsmen.sql` hand-edited from drizzle-kit auto-output to insert SQL backfill (`'#' || substr(md5(name), 1, 6)`) before `SET NOT NULL` — backfilled rows get arbitrary deterministic hex; runtime new rows go through `colorFromName` and land in the curated palette.

Per-commit narrative lives in `git log`; ADRs + coding-practices + glossary are the source of truth for the locked decisions.

## Working tree at pause

HEAD on `main` is `0f464cd chore: complete backend v1`. Code is fully committed; the 2026-07-03 session added uncommitted **docs only**: `docs/stable/_shared/design/final-ui/` (13 mockup HTML files + README) and this handoff's update. User commits manually.

The only startup action the next session may need: `bun --cwd apps/backend run db:migrate` to apply migrations `0002` / `0003` / `0004` to the local Postgres (if not already done since the user last ran the script).

## Final-UI mockups (2026-07-03)

`docs/stable/_shared/design/final-ui/` — one standalone HTML file per v1 surface, containing **only the chosen design direction** (the exploratory multi-direction mockups included scrapped variants). Rebuilt against specs 01–05 with drift corrected: locked 12-color picker palette (matches `apps/backend/src/utils/color.ts`), recurrence as a single 4-option enum picker (no boolean), two-mode label delete + deleted-labels view, v1-scope Inbox ("Now" only), no rejected layout variants. `final-ui/README.md` is the index. Specs remain authoritative on any disagreement.


## Backlog (priority order)

### 1 · TS style grill round — **COMPLETE + COMMITTED**

All 11 topics locked in coding-practices and ESLint-enforced where applicable. See "What's done" above for the full rule-section list.

### 1.5 · ESLint / Prettier / Husky / Commitlint config merge — **COMPLETE + COMMITTED**

See "What's done" above for landed config inventory.

### 2 · Phase-1 carry-forwards (verified pending against current code)

From [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md) — that handoff is still authoritative for the dep-bump detail; this list is the verified-still-pending subset:

- **`apps/backend/tsconfig.json`** still has `baseUrl: "./"` + `ignoreDeprecations: "6.0"` shim (lines 13–14). Must remove + adapt `paths` before TS 7. (Note: a similar shim was also added to the **root** `tsconfig.json` during the session that landed `08a7b30` — both files carry the same future-removal flag.)
- ~~**Misplaced `extendZodWithOpenApi(z)`**~~ — **DONE** as part of the Phase Z mechanical renames in `800f9a5`. Registration extracted to dedicated `apps/backend/src/utils/openapi-extension.ts`; `*.types.ts` files are all pure-Zod; side-effect-only import lives in `apps/backend/src/index.ts`. See coding-practices §"`extendZodWithOpenApi(z)` registered once via `utils/openapi-extension.ts`".
- **Schema-sharing architecture — RESOLVED 2026-07-03 (deferred, approach locked)**. Background: FE *value*-imports of backend Zod schemas pull the drizzle-zod runtime + Zod into the FE bundle (bundle scan 2026-05-19: pg-core / postgres / BetterAuth / Hono all tree-shaken out in prod; drizzle-zod + Zod stay; dev mode doesn't tree-shake at all). With the current FE being scrapped there is zero live value-import today, so nothing to do now. **When the next FE starts and needs runtime schemas**, use spec-driven codegen from the OpenAPI spec the backend already emits via `@hono/zod-openapi`: `openapi-typescript` for types, `openapi-zod-client` / `orval` for generated Zod validators (orval can also emit query-hook clients). This is the industry-standard contract-first shape (backend → spec ← FE), needs no custom tooling, and fully decouples the FE from the backend source tree. It supersedes the earlier idea of a custom codegen script mirroring drizzle-zod schemas into `packages/schemas/` — same single-SoT guarantee (Drizzle stays SoT for tables; the spec is generated from it), standard tools instead of bespoke ones. **Never** hand-author a parallel Zod mirror — generation avoids dual-source drift. Type-only sharing via Hono RPC `AppType` stays as-is (erased at compile, zero runtime cost).
- **`apps/react19` + `packages/utils` deps** — runtime deps still on phase-1 versions. **Moot for react19** (app will be scrapped; see §6); `packages/utils` bump still nice-to-have.
- **ESLint warnings** — 7 remaining, all on `apps/react19` tanstack-router route files. **Moot** — react19 will be scrapped (see §6). Leave as-is.

### 3 · Controller error-throwing restructure (ADR-0012) — **COMPLETE + COMMITTED**

See "What's done" above (commit `21114cc`).

### 4 · Library-API drift audit (Drizzle / Zod / errors)

The project was originally scaffolded against older versions of Drizzle, Zod, and `@hono/zod-openapi`. Phase-1 dep upgrades bumped the versions (Zod 4.4.3 · Drizzle ORM 0.45.2 · `@hono/zod-openapi` 1.4.0 · `drizzle-zod` 0.8.3) but code shape was preserved mechanically. Patterns currently in the codebase may be:

- **Pre-Zod-4** — `safeParse` result shape, `z.prettifyError`, `extendZodWithOpenApi` registration boilerplate, `.openapi()` chain placement, error-issue shapes.
- **Pre-Drizzle-0.45** — `.where()` chaining semantics (ADR-0009/0010 + Cluster A addressed the worst case but residuals may remain), relational-query v1 vs v2 syntax, `$onUpdate` patterns, `pgEnum` vs app-side enum per [ADR-0019](../../stable/_shared/adr/0019-enum-validation-at-app-boundary-only.md).
- **Error-handling residuals** — search for `try/catch` in services (should bubble), `AppError` / `EndpointError` thrown from non-controller layers (per ADR-0012 these shouldn't exist outside the controller boundary, and the restructure round in §3 above will remove the controller ones too).

Output: coding-practice updates · ADRs (when load-bearing) · rewrite tickets. Best run after the TS style grill round (§1) so style is locked first, and folded into §3 where overlap exists. The redundant `extendZodWithOpenApi(z)` in §2 is a known sub-item of this audit.

### 5 · Backend v1 changes (from design phase) — **ALL ITEMS DONE + COMMITTED**

Authoritative list: [`docs/stable/_shared/design/backend-changes-summary.md`](../../stable/_shared/design/backend-changes-summary.md). Items 1–4 committed earlier (see "What's done"); items 5–10 + the grill-resolved additions (9b restore endpoints, 9c single-read `includeDeleted`) committed in `0f464cd`. Verification: backend `tsc` clean · react19 build clean · lint 0 errors / 7 pre-existing warnings. **No runtime testing yet** — no test infra exists. Per-item detail:

5. ✅ **`GET /tasks` filter extensions** — **DONE** (uncommitted, 2026-07-02). Multi-value `projectId` / `status` / `priority` / `labelId` (repeated-key encoding, grilled + locked in coding-practices §"Multi-value query params use repeated keys"; new `multiValueQueryParam` helper at `apps/backend/src/utils/query-params.ts`); inclusive range `dueDateGte` / `dueDateLte` (`z.coerce.date()` — this also replaced the old `dueDate: z.string().datetime()` + controller-side `new Date()` conversion + the `Omit<GetTasksQuery, 'dueDate'> & { dueDate?: Date }` type hack across service/repo — all three layers now just use `GetTasksQuery`); case-insensitive title search `q` (`ilike` with LIKE-wildcard escaping); `labelId` filter via `EXISTS` subquery on `task_labels` (`inArray` for OR-within-field). Backwards-compat single-value `dueDate` (exact match) retained. Filter semantics: OR within a field, AND across fields.
6. ✅ **`GET /reminders` filter extensions** — **DONE** (uncommitted, 2026-07-02). Multi-value `taskId` (repeated-key) + inclusive `remindAtGte` / `remindAtLte` ranges. `getRemindersQuerySchema` rewritten as an explicit object (the old derived-from-`selectReminderSchema` form carried dead `expired` / `beforeOf` / `id` fields that no repo code ever implemented — dropped; the Inbox "Now" bucket is `remindAtLte=<now>`).
7. ✅ **`GET /labels` + `taskCount`** — **DONE** (uncommitted, 2026-07-02). Aggregate join: `leftJoin(task_labels) → leftJoin(tasks ON id AND tasks.deleted_at IS NULL) → groupBy(labels.id)` with `count(tasks.id)::int`. The live-task filter lives in the JOIN condition (not WHERE) so zero-task labels return with `taskCount: 0`. New `labelWithTaskCountSchema` / `LabelWithTaskCount` in `labels.types.ts`; list-route response schema + repo/service signatures updated.
8. ✅ **Label delete tiers on `DELETE /labels/:labelId`** — **DONE** (uncommitted, 2026-07-02) per [ADR-0007](../../stable/_shared/adr/0007-two-mode-label-delete.md): bare = soft delete keeping `task_labels`; `?removeFromTasks=true` = soft delete + wipe join rows (single `db.transaction`); `?permanent=true` = hard delete via new `hardDeleteLabel` repo method (`deletedAt IS NOT NULL` guard as defense-in-depth), service 409s (`ConflictError`) when the label isn't soft-deleted yet, 404s when it doesn't exist; both flags = 400 (`ValidationError`). Route declares BAD_REQUEST + CONFLICT responses.
9b. ✅ **Restore endpoints** — **DONE** (uncommitted, 2026-07-02). `POST /tasks/:taskId/restore` + `/labels/:labelId/restore` + `/reminders/:reminderId/restore` per the amended [ADR-0002](../../stable/_shared/adr/0002-soft-delete-via-deletedat.md). Repo `restoreX` nulls `deletedAt` with **no** `IS NOT NULL` guard — restoring a live row is an idempotent success (double-click races from the deleted-items view are harmless); 0 rows = 404. Returns the restored entity.
9c. ✅ **`includeDeleted` on single-row reads** — **DONE** (uncommitted, 2026-07-02). Shared `includeDeletedQuerySchema` added to `utils/query-params.ts`; wired on `GET /tasks/:taskId` + `/labels/:labelId` + `/reminders/:reminderId` (route query → controller → service opts → repo conditional `isNull` filter). The tasks repo's former `activeTaskWhere` helper was inlined back into a conditions-array for the read path (still used by the write paths).
10. ✅ **`GET /export/tasks` + `GET /export/preferences`** — **DONE** (uncommitted, 2026-07-02). New `export` feature folder (`apps/backend/src/features/export/` — routes/controller/service/types only; owns no tables so no `.db.ts`/`.repository.ts`). The service composes cross-feature repo reads (`Promise.all` over tasks / reminders / projects / labels / task-labels) per coding-practices §"Cross-feature reads call the repo". New `getTaskLabels(userId)` read on the labels repo (M2M rows scoped via labels join). Bundle shape: `{ exportedAt, version: 1, tasks, reminders, projects, labels, taskLabels }` with optional `includeDeleted=true`. `/export/preferences` returns an empty blob in v1 (preferences are localStorage-backed; server store lands with v1.5 `users/preferences`). Registered as `exportRouter` in `app.ts`.

Items deferred to v1.5 / v2 (same doc): `acknowledgedAt` on reminders · `position` on tasks · `task_events` / `comments` / `notifications` tables · server-side `users/preferences` · attachments · subtasks · sharing. Don't start these now.

### 6 · Next frontend — from scratch

`apps/react19` will be **scrapped**, not continued; the next FE restarts from zero. The stack/approach decision is deliberately **not recorded in repo docs** (user preference — lives in session memory `project_next_frontend`). It will be its own multi-session plan informed by design specs 01–05 + the `final-ui/` mockups. Cross-reference [`./design-phase-complete-2026-05-14.md`](./design-phase-complete-2026-05-14.md). When it needs runtime schemas, follow the schema-sharing resolution in §2 above.

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
- Next-FE direction — kept out of repo docs on purpose (`project_next_frontend`).
