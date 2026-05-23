---
created: 2026-05-19
updated: 2026-05-19
summary: Backend fix phase (round-1 grilling + Cluster A security + Cluster B ADR-mandated wiring + Cluster C mechanical cleanups) fully complete and committed. TS style grill round in progress — casing + export-style topics locked + committed in `08a7b30`; import-order locked + enforced via the §1.5 ESLint/Prettier/Husky/Commitlint config-merge work (uncommitted in working tree alongside ~93 autofix-reformatted files). Remaining TS style topics still queued (nullish coalescing, `null`/`undefined`, `unknown`/`any`, const-assertion, discriminator name, `readonly` defaults, async iteration, module-`const` vs static-method class). This doc is the cold-boot brief — it lists the remaining backlog (TS style remaining topics, phase-1 carry-forwards, controller error-throwing restructure, library-API drift audit, backend v1 design changes, Vue/Nuxt FE).
---

# Handoff — backend fix phase complete + TS style grill round in progress (2026-05-19)

**Status**: backend fix phase fully complete *and committed* (Cluster A + Cluster B1–B7 + Cluster C, all merged on main via `7a4ea02` and predecessors). **TS style grill round in progress**: casing rules, export-style rules (including barrels, side-effect imports, `extendZodWithOpenApi` relocation), and import-order grouping are all fully grilled and locked into [`docs/llm/coding-practices.md`](../../llm/coding-practices.md). Casing + export-style entries were committed mid-session as `08a7b30 continue grilling session`; the import-order rule landed via the §1.5 config-merge work (uncommitted — see "What's uncommitted" below).

The casing + export-style decisions still imply ~5–6 mechanical renames + the multi-file `extendZodWithOpenApi` move (queued in §1, not done yet). Remaining TS style topics can be grilled in any order (no config dependency).

## How to resume cold

1. Read [`CLAUDE.md`](../../../CLAUDE.md) at the repo root.
2. Read [`docs/llm/behavior.md`](../../llm/behavior.md) end-to-end — the grill-protocol "Style" rule was tightened in commit `08a7b30` to require one question at a time (agent may list the agenda up front but grills only one sub-question at a time).
3. Read this handoff end-to-end.
4. Read the casing + export-style entries in [`docs/llm/coding-practices.md`](../../llm/coding-practices.md) — committed in `08a7b30`: casing table · named-exports rule · barrels Pattern B · `extendZodWithOpenApi(z)` relocation · side-effect imports rule.
5. (Optional, if you're about to touch phase-1 leftovers) read [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md).
6. (Optional, if you're starting frontend work) read [`./design-phase-complete-2026-05-14.md`](./design-phase-complete-2026-05-14.md).
7. Verify git state: `git log --oneline | head -10` should show `08a7b30 continue grilling session` as HEAD on `main`. `git status` should show only this handoff file modified (or be clean if user has since committed this handoff edit).
8. Pick the next chunk from §Backlog — §1.5 (config-merge) is complete; most likely next is one of: (a) commit the §1.5 changes per the suggested grouping in "What's uncommitted"; (b) fix the pre-existing react19 build error (`src/app.tsx:16` missing `isRefetching` field); (c) execute the §1 mechanical renames; (d) start the remaining TS style topics (nullish coalescing, `null`/`undefined`, `unknown`/`any`, etc.) in any order.

## What's done (in repo, committed)

- **Round-1 grilling** — all 17 architectural/behavioral items locked in [ADRs 0008–0020](../../stable/_shared/adr/), backend coding-practice rules in [`docs/llm/coding-practices.md`](../../llm/coding-practices.md), and entries in [`docs/stable/_shared/glossary.md`](../../stable/_shared/glossary.md). 2 TypeScript pre-locks (arrow-default, `type` default) also recorded in coding-practices.
- **Fix-phase Cluster A** (security) — committed (`db05afe`).
- **Fix-phase Cluster B1–B7** (ADR-mandated wiring) — committed (`e54fe04 · d03ef51 · f165bc5 · 62c289f · 97d36dc`).
- **Fix-phase Cluster C** (mechanical cleanups #19 · #20 · #23 · #24 · #33 · #34 · #35 + `deleteReminder` alignment) — committed (`7a4ea02`).
- **TS style grill round — casing rules + export-style rules (barrels, side-effect imports, `extendZodWithOpenApi` relocation) + behavior.md grill-protocol tweak** — committed mid-session (`08a7b30 continue grilling session`). The commit also includes user's three exploratory edits made independently of the grill flow: (1) `apps/backend/src/features/projects/projects.types.ts` had its `extendZodWithOpenApi(z)` call + import **commented out** (one of the 4 locations slated for the relocation; the other 3 — `labels.types.ts` / `reminders.types.ts` / `tasks.types.ts` — still have the live calls, and the commented form in `projects.types.ts` should be deleted entirely rather than left commented when the relocation lands); (2) `apps/react19/package.json` added a `build:report` script (currently identical to `build` — placeholder, likely for a future bundle-visualizer plugin); (3) the root `tsconfig.json` got an `ignoreDeprecations: "6.0"` shim with a `// TS6: baseUrl deprecated; remove baseUrl + adapt paths in phase 2 before TS7` comment — note this is the **root** tsconfig, distinct from `apps/backend/tsconfig.json` (which also still has the same shim, tracked in §2 phase-1 carry-forwards).

Per-commit detail and the "locked decisions" table previously lived in the now-deleted `backend-grill-round1-complete-2026-05-18.md`. The ADRs + coding-practices + glossary are the source of truth for those decisions; the git log is the source of truth for the per-commit narrative.

## What's uncommitted (this session)

Large delta — ~99 files modified + several added/deleted — almost entirely the §1.5 config-merge work plus `eslint --fix` reformatting the codebase to `printWidth: 120` + the new `simple-import-sort` grouping. Net diff ≈ +1104 / −1319 lines (line consolidations dominate due to the printWidth bump).

Touched / added / deleted files at a glance:

- **Tooling configs (added/modified)**: `eslint.config.mjs` (full rewrite), `prettier.config.js` (printWidth 120, dropped astro override), `.prettierignore` (consolidated, glob fixes), `commitlint.config.js` (new file: type-enum trimmed + `perf` + `test`), `.lintstagedrc.json` (imported, now active), `scripts/prepare-commit-msg.ts` (new file: comment template), `.husky/commit-msg`, `.husky/prepare-commit-msg`, `.husky/pre-commit`, `package.json` (devDependencies for the new plugins), `bun.lock` (lockfile updated by `bun install`).
- **Deleted**: `lint-staged.config.js` (superseded by `.lintstagedrc.json` as part of the `.prettierignore` / lint-staged consolidation), `apps/react19/.prettierignore` (consolidated into root).
- **Kept for manual user comparison** (in ignores so it doesn't lint): `other_project_eslint.config.js`.
- **Code reformatted by autofix only**: every `.ts` / `.tsx` file in `apps/backend/src`, `apps/react19/src`, `packages/utils`, `scripts/`, plus `apps/backend/drizzle.config.ts` and `apps/react19/vite.config.ts`. Purely whitespace + import-order rewrites — no semantic changes.
- **Two real edits (byproduct cleanups landed during the lint-fix pass)**:
  - `apps/backend/src/features/projects/projects.types.ts` — orphan `import {} from './projects.db'` and the commented-out `extendZodWithOpenApi(z)` lines deleted. File is now pure-Zod.
  - `apps/react19/src/routes/__root.tsx` — inline `import('@tanstack/react-query').QueryClient` annotation hoisted to a proper `import type { QueryClient } from '@tanstack/react-query'`.
- **Docs**: `docs/llm/coding-practices.md` (import-order rule added), this handoff file.

Verification at session end:

- `bunx eslint .` — **0 errors, 10 warnings** (pre-existing FE drift, same as §2 phase-1 carry-forward).
- `bun --cwd apps/backend run build` — clean.
- `bun --cwd apps/react19 run build` — fails with a **pre-existing TS error** (`src/app.tsx:16` missing `isRefetching` field in initial auth-context literal — BetterAuth API surface expanded after this code was authored). Verified pre-existing via `git stash` round-trip. Not caused by this PR. Fix: add `isRefetching: false` to the literal at `src/app.tsx:16-21`. Tracked as a separate cleanup item.

Suggested commit grouping (user's call):

- **Commit 1**: tooling configs only (`eslint.config.mjs`, `prettier.config.js`, `.prettierignore`, `commitlint.config.js`, `.lintstagedrc.json`, `scripts/prepare-commit-msg.ts`, husky hooks, `package.json`, `bun.lock`, deleted `lint-staged.config.js` + `apps/react19/.prettierignore`, kept `other_project_eslint.config.js`, docs).
- **Commit 2**: the 93-file lint-fix reformatting (purely whitespace + import-sort). Separate commit keeps history clean and reviewable.
- **Commit 3** (optional, can fold into 1): the two byproduct edits in `projects.types.ts` + `__root.tsx`.

Suggested commit message types: `chore` for #1, `style` for #2 (purely formatting), `refactor` for #3.

## Backlog (priority order)

### 1 · TS style grill round (in progress)

**Status**: casing rules, export-style rules, and import-order grouping are all fully grilled and locked into [`docs/llm/coding-practices.md`](../../llm/coding-practices.md). Casing + export-style rules committed in `08a7b30`; import-order rule landed via the §1.5 config-merge work along with the ESLint config that enforces it. Remaining topics (nullish coalescing, `null`/`undefined`, etc. — full list below) still queued.

**Locked this session (2026-05-19)** — refer to the matching section heading in [`docs/llm/coding-practices.md`](../../llm/coding-practices.md) for the canonical rule text:

- **Casing rules** — single table covers every identifier kind: variables/functions/methods `camelCase`; types/interfaces/classes `PascalCase`; module-level frozen data consts (`as const` arrays, lookup tables, primitive literals, `Object.freeze({...})` maps, `as const satisfies …` registries) `SCREAMING_SNAKE_CASE`; Zod schemas `camelCase` + `Schema` suffix (no PascalCase variant); files / dirs `kebab-case` unconditionally; route URL segments `kebab-case`; route path params + query keys `camelCase`; DB tables `snake_case` plural; DB columns Postgres `snake_case` → Drizzle TS `camelCase`; env vars `SCREAMING_SNAKE_CASE`; domain enum string literal members `snake_case` default (single-word lowercase reads as snake_case-of-length-one; per-field deviation documented at declaration). Cross-cutting standards (HTTP verbose codes, etc.) keep their well-known convention. Linter enforcement via `@typescript-eslint/naming-convention` deferred to §1.5.

- **Export-style cluster** — locked as a coherent set in coding-practices:
  - §"Named exports default; `export default` only when an external API mandates it" — Bun's `{ port, fetch }` is the canonical carve-out; pending mechanical renames cover `env.ts` + 4 routers.
  - §"Barrels: public-API only (Pattern B)" — barrels exist only when `package.json` `exports` references them; internal-only barrels forbidden. Allowed barrel sources: `*.db.ts` + `*.types.ts`; server-only modules (`*.routes.ts` / `*.controller.ts` / `*.service.ts` / `*.repository.ts`) forbidden as barrel sources. Re-export form: explicit named lists, `export *` banned; types via `export type { … }`. Internal code uses deep paths, never own barrel — enforced via `import-x/no-restricted-paths`. External consumers go through the `package.json` `exports` map only; deep-pathing into `dist/**` or `src/**` from outside the package forbidden.
  - §"`extendZodWithOpenApi(z)` registered once in `createApp()`; `*.types.ts` stays pure Zod" — registration moves from the 4 `*.types.ts` files (where `.openapi()` is never called) to a single call inside `createApp()` in `apps/backend/src/utils/create-app.ts` (before any route is mounted). Prototype mutation is retroactive. Side benefit: `*.types.ts` becomes pure Zod and joins the FE-safe import graph.
  - §"Side-effect-only imports + boot-time top-level side effects" — side-effect-only `import './x'` banned outside the per-app entry, except bundler-mandated CSS/asset imports anywhere. Top-level side-effecting calls banned in feature/utility modules; allowed in clearly-marked boot modules (`env.ts` is the only example today; mark with a top-of-file comment).
  - **Schema-sharing future** — verified bundle scan (see §2 carry-forward) shows current Pattern B leaks only `drizzle-zod` runtime + Zod (drizzle ORM + pg-core + postgres driver + BetterAuth all tree-shaken out). The deferred codegen-mirror restructure is documented in the same §2 entry.

- **Grill-protocol tweak** — `docs/llm/behavior.md` §"Grill-with-me · Style" updated (2026-05-19) to enforce **one question at a time**: agent may list the agenda for a topic up front so the user sees what's coming, but only one sub-question is being grilled at any moment; never expect the user to answer a multi-question batch in any order.

- **Anti-dangling-reference rule** — `docs/llm/behavior.md` §"Never reference session-local thinking artifacts" added (2026-05-24): code comments and stable docs must reference stable artifacts (ADRs / coding-practices section headings / glossary entries) by full readable name, never session-local labels (plan files at `~/.claude/plans/**`, grilling decision IDs, internal codename labels). Handoffs follow the same discipline.

**Mechanical renames + small rewrites queued by the locked decisions above** — batch into one or two PRs when execution resumes:

1. `apps/backend/src/utils/env.ts`: drop `export default env`; update the 7 consumer sites to `import { env } from '…'` (`hc.ts`, `index.ts`, `db/index.ts`, `utils/logger.ts`, `utils/create-app.ts`, `utils/auth.ts`, `utils/errors/http-errors.ts`).
2. `apps/backend/src/utils/env.ts`: add a top-of-file boot-module marker comment per the coding-practices §"Side-effect-only imports + boot-time top-level side effects" rule (top-level `console.log`, `safeParse`, and `process.exit(1)` are intentional).
3. 4 router files (`labels.router.ts`, `projects.router.ts`, `reminders.router.ts`, `tasks.router.ts`): `export default xRouter` → `export const xRouter`; update `apps/backend/src/app.ts` imports accordingly.
4. `apps/backend/src/features/tasks/tasks.db.ts`: rename `statusOptions` / `priorityOptions` / `recurringOptions` → `STATUS_OPTIONS` / `PRIORITY_OPTIONS` / `RECURRING_OPTIONS` per the SCREAMING-SNAKE-for-frozen-data-consts rule. Update the consuming `tasks.types.ts`, `tasks.db.ts` column-`enum` references, and `apps/backend/src/features/tasks/index.ts` barrel re-export list.
5. `apps/backend/src/utils/status-codes.ts`: rename `verboseStatusCodes` → `VERBOSE_STATUS_CODES`. Update all consumers.
6. `extendZodWithOpenApi(z)` relocation: delete the call + the `@hono/zod-openapi` import from the 3 still-live `*.types.ts` files (`labels.types.ts` / `reminders.types.ts` / `tasks.types.ts`). `projects.types.ts` is already fully cleaned (the orphan `import {}` line + commented-out lines were deleted during the §1.5 lint-fix pass). Add a single `extendZodWithOpenApi(z)` call inside `createApp()` (in `utils/create-app.ts`) with a `// must run before any route's .openapi() chain executes` comment.
7. Audit feature barrel re-exports for any newly-mismatched names after the SCREAMING-SNAKE renames; `apps/backend/src/features/tasks/index.ts` is the only barrel that re-exports option arrays today.
8. Wire the two deferred ESLint rules — `@typescript-eslint/naming-convention` (encodes the casing table from coding-practices §"Casing rules") and `import-x/no-default-export` (encodes coding-practices §"Named exports default …"). Both rules are easier to land *after* the mechanical renames in items 1–6 above clear the codebase of known drift.

These can land in any order; item 8 specifically wants items 1–6 done first.

**Remaining TS style topics still to grill**:

- `??` vs `||` policy.
- `null` vs `undefined` policy.
- `unknown` vs `any` (assume zero-`any`; lock the rule).
- `const` assertion vs explicit literal type.
- Discriminated-union discriminator name (`kind` vs `type`).
- `readonly` defaults on type members.
- Async iteration — `for...of` vs `.map(await)`.
- Module-level `const` vs class with static methods.

These don't depend on the ESLint config — they can be grilled in any order.

### 1.5 · ESLint / Prettier / Husky / Commitlint config merge — **complete**

Imported user's main-project tooling and merged it with the existing react19-specific block.

Landed:

- **`eslint.config.mjs`** rewritten. `tseslint.configs.strict` baseline with `no-explicit-any` + `no-non-null-assertion` downgraded to `warn` so they surface drift without blocking commits; `eslint-plugin-prettier/recommended` integrated so `eslint --fix` formats; `simple-import-sort` configured with the 7-group ordering described in coding-practices §"Import order"; `unused-imports` plugin for autofixable removal; `consistent-type-imports` with inline-type-imports fix style; repo-specific rules wired (`import-x/no-restricted-paths` for the barrel-internal-consumer rule from coding-practices §"Barrels: public-API only (Pattern B)", `no-restricted-syntax` for ban-on-`export *` and side-effect-only imports with CSS/asset carve-out + per-app-entry override block). Backend + react19 per-app blocks preserve `projectService: true`, per-block globals, and react19's `react-hooks` / `react-refresh` / `@eslint-react` / `@tanstack/query` rules. `react-refresh/only-export-components` extended with `allowExportNames: ['Route']` for tanstack-router files. `other_project_eslint.config.js` kept (per user — manual comparison) but added to ignores.
- **`prettier.config.js`** — kept `printWidth: 80`; astro override dropped.
- **`max-len: 80`** ESLint rule (`'warn'`) mirrors Prettier as a safety net.
- **`.prettierignore`** consolidated to single root file with glob fixes + new entries; workspace-local `apps/react19/.prettierignore` deleted.
- **`commitlint.config.js`** — type-enum: `[feat, fix, chore, docs, style, refactor, revert, perf, test]` (dropped `content`, added `perf` + `test`).
- **`scripts/prepare-commit-msg.ts`** — comment template + examples mirror the new type set.
- **`lint-staged.config.js`** (legacy custom file) deleted; `.lintstagedrc.json` (imported clean version) wins.
- **`docs/llm/coding-practices.md`** — §"Import order" rule entry added.

Deferred from this PR (intentional):

- `@typescript-eslint/naming-convention` (encodes coding-practices §"Casing rules") — wired after the §1 mechanical renames so the codebase already matches the target shape before the rule turns on.
- `import-x/no-default-export` (encodes coding-practices §"Named exports default …") — wired alongside the §1 mechanical renames (env.ts + 4 routers + tanstack-router route file decisions).

Lint state after the PR: **0 errors, 10 warnings**. The 10 warnings are pre-existing FE drift on tanstack-router route files (`react-refresh/only-export-components`) + 1 type-only var bound as a value (`unused-imports/no-unused-vars`) — all match the existing §2 phase-1 carry-forward "ESLint warnings" entry. Resolution is a separate FE-discipline PR.

Auto-fix scope on first `bunx eslint . --fix` run: ~93 files reformatted (import sort + minor format adjustments). Net diff ≈ +1104 / −1319 lines.

Pre-existing TS build issue discovered (NOT caused by this PR, verified via `git stash` round-trip): `apps/react19/src/app.tsx:16` — initial `auth` context literal missing the `isRefetching` field that `useAuthSession`'s return type now requires (BetterAuth API surface expanded). Tracked as a separate cleanup item — recommended fix: add `isRefetching: false` to the literal at `src/app.tsx:16-21`.

Two byproduct cleanups that landed incidentally during the lint-fix pass:

- `apps/backend/src/features/projects/projects.types.ts` — the orphan `import {} from './projects.db'` + the commented-out `extendZodWithOpenApi(z)` lines (left behind in commit `08a7b30`) were deleted. Side benefit: this is one of the 4 files slated for the `extendZodWithOpenApi` relocation; `projects.types.ts` is now fully done. Three sibling `*.types.ts` files (`labels`, `reminders`, `tasks`) still have the live calls and remain in the §1 mechanical-renames list.
- `apps/react19/src/routes/__root.tsx:12` — inline `import('@tanstack/react-query').QueryClient` type annotation hoisted to a proper `import type { QueryClient } from '@tanstack/react-query'` (fixes the `@typescript-eslint/consistent-type-imports` rule which forbids `import()` type annotations).

### 2 · Phase-1 carry-forwards (verified pending against current code)

From [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md) — that handoff is still authoritative for the dep-bump detail; this list is the verified-still-pending subset:

- **`apps/backend/tsconfig.json`** still has `baseUrl: "./"` + `ignoreDeprecations: "6.0"` shim (lines 13–14). Must remove + adapt `paths` before TS 7.
- **Misplaced `extendZodWithOpenApi(z)`** present in 3 `*.types.ts` files live + 1 commented out: `labels.types.ts:2-3` · `reminders.types.ts:3-4` · `tasks.types.ts:3-4` (still live as of commit `08a7b30`); `projects.types.ts:3-4` (commented out in `08a7b30` — needs full deletion of the commented lines + the orphan `import {} from './projects.db'` line). Fix per coding-practices §"`extendZodWithOpenApi(z)` registered once in `createApp()`; `*.types.ts` stays pure Zod": delete the 3 live calls + their `@hono/zod-openapi` imports + the commented variant, leaving those files on pure `zod/v4`. Add a single `extendZodWithOpenApi(z)` call inside `apps/backend/src/utils/create-app.ts`'s `createApp()` factory, before any route is mounted. Schemas in `*.db.ts` / `*.types.ts` are never touched by `.openapi()` (verified: zero call sites across all 4 features); only `*.routes.ts` calls `.openapi()` (6 chains). Prototype mutation is retroactive, so the boot-time registration covers all constructed schemas. Side benefit: `*.types.ts` becomes part of the FE-safe import graph (no longer drags `@hono/zod-openapi`).
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

Output: coding-practice updates · ADRs (when load-bearing) · rewrite tickets. Best run after the TS style grill round (§1) so style is locked first, and folded into §3 where overlap exists. The redundant `extendZodWithOpenApi(z)` in §2 is a known sub-item of this audit.

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
