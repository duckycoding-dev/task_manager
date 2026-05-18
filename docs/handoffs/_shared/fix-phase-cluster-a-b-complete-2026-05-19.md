---
created: 2026-05-19
updated: 2026-05-19
summary: Backend fix phase Cluster A (security) + Cluster B (ADR-mandated wiring · 7 sub-commits) are complete and committed. Working tree is clean. What remains is Cluster C — 7 mechanical cleanups that can land as one bundled commit or several. After Cluster C lands, the deferred TS style grill round (Phase Z) starts, then the controller error-throwing restructure. This doc is the cold-boot brief for the next chat / machine.
---

# Handoff — fix-phase Cluster A + B complete (2026-05-19)

**Status**: round 1 grilling done since 2026-05-18. Cluster A + Cluster B (B1 → B7) all landed and committed. Working tree is clean. Resume from any machine with this doc + `CLAUDE.md`. The previous handoff (`backend-grill-round1-complete-2026-05-18.md`) is now superseded — it can be deleted once this one is read.

## How to resume cold

1. Read [CLAUDE.md](../../../CLAUDE.md) at the root.
2. Read this handoff end-to-end.
3. Verify state: `git log --oneline | head -10` should show the commits listed below.
4. Start at **Cluster C · mechanical**. Bundle into one `chore: backend cleanups` commit OR split per your taste — none of the 7 items depend on each other.
5. After Cluster C → **Phase Z** (TS style grill round) → **controller error-throwing restructure** (separate round, larger).
6. User commits manually after diff review. Never auto-commit.

## What's done (committed)

Round 1 grilling: see [`backend-grill-round1-complete-2026-05-18.md`](./backend-grill-round1-complete-2026-05-18.md) for the locked decisions index. ADRs 0008–0020 + ~22 coding-practice rules + ~15 glossary entries are in repo.

Fix-phase commits (in topological order):

| Commit  | Cluster | Title (as-merged)                                                        | Touches                                                                                              |
| ------- | ------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| db05afe | A       | `fix(security): close cross-user data leak in tasks/labels list queries` | `tasks.repository.ts` getTasks · `labels.repository.ts` getLabels · dead-code removal                |
| e54fe04 | B1      | `feat(utils): add safe() utility for opt-in error inspection`            | new `utils/safe.ts`                                                                                  |
| d03ef51 | B2      | `refactor error handling`                                                | `domain-errors.ts` (DomainError + 6 subclasses + DOMAIN_ERROR_MAP) · `http-errors.ts` errorHandler   |
| f165bc5 | B3      | `fix naming`                                                             | `hideToClient` → `showToClient` rename · polarity flip · 2 sites opt-in `showToClient: true`         |
| 62c289f | B4      | `fix(repo): wire RepositoryValidationError with real failing input + issues` | `domain-errors.ts` `RepositoryValidationError` new signature · 23 call sites across 4 repo files     |
| 97d36dc | B5+B6+B7 | `refactor(auth): extract AUTH_CTX_KEYS constants per coding-practice`   | new `utils/auth-context.ts` · auth.ts · 4 controllers (28 sites) · `env.ts` `LOG_LEVEL` enum · `docs/stable/backend/error-handling.md` doc refresh |

Detailed per-commit narrative lives in the plan file (`~/.claude/plans/init-this-is-a-humble-nova.md`) under each `[x]` entry.

## What's left

### Cluster C · mechanical cleanup (7 items)

None of these depend on each other. Bundle as one commit or split — your call. All are 1-file or 1-line changes.

| #  | Path:line(s)                                                                  | Fix                                                                                                                                       |
| -- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 19 | `apps/backend/src/utils/create-app.ts:36`                                     | Function `popoulateRouter` — typo in name + `@deprecated` JSDoc. Grep for callers; if used, rename to `populateRouter`; if unused, delete the function entirely (cleaner). |
| 20 | `apps/backend/src/utils/errors/http-errors.ts` (JSDoc on `EndpointError`)     | Typo in JSDoc example: `'INTERAL'` → `'INTERNAL_SERVER_ERROR'`. The example code is wrong in the comment.                                  |
| 23 | `apps/backend/src/utils/configure-open-api.ts`                                | Hardcoded `'Hono API'` title. Replace with values from the workspace `package.json` (`name` + `version`). Import via `import pkg from '../../package.json' with { type: 'json' };` or equivalent. |
| 24 | `apps/backend/src/utils/mapping.ts` `nullsToUndefined`                        | Fragile `obj.constructor.name === 'Object'` check breaks across realms / proxies. Two acceptable fixes: (1) replace with `Object.getPrototypeOf(obj) === Object.prototype` (correct + works across realms), or (2) accept the fragility and add an inline `// known limitation` note. Pick (1) unless there's a reason to keep the current shape. |
| 33 | `apps/backend/src/features/labels/labels.routes.ts:37,76,98`                  | Route param `:id` → `:labelId`. Update Zod path schemas + controller call sites that read `c.req.param('id')` accordingly. Grep `c.req.param` in `labels.controller.ts` for surviving readers. |
| 34 | `apps/backend/src/features/reminders/reminders.routes.ts:36,101,+`            | Route param `:id` → `:reminderId`. Update Zod path schemas + controller call sites. Grep first to catch any instances beyond the listed lines. |
| 35 | `apps/backend/src/features/tasks/tasks.service.ts` (interface + impl)         | Method `getTasksById` → `getTaskById` (singular — return cardinality is one). Update the interface, the impl, and the controller call site (`tasks.controller.ts`). |

### Verification per item

- After each: `bun run --cwd apps/backend build` should stay clean.
- After #33 + #34: re-run any frontend hitting these routes to confirm path-param changes didn't break the RPC client wiring (`apps/react19`).
- After #35: grep `getTasksById` across the repo to confirm zero residual references.

### Suggested commit (if bundled)

```
chore(backend): backend cleanups (#19 #20 #23 #24 #33 #34 #35)

- create-app.ts: remove the misspelled deprecated `popoulateRouter`.
- http-errors.ts JSDoc: 'INTERAL' typo → 'INTERNAL_SERVER_ERROR'.
- configure-open-api.ts: OpenAPI title now reads from package.json.
- mapping.ts nullsToUndefined: replace fragile constructor-name check
  with prototype-based guard.
- labels.routes.ts + reminders.routes.ts: route params entity-prefixed
  (:labelId, :reminderId) per Item 11 coding-practice.
- tasks.service.ts: rename getTasksById → getTaskById per Item 12
  plurality rule.
```

## After Cluster C

### Phase Z · TS style grill round (deferred)

~10–12 short grills. Plan file already enumerates them; reproduced here for completeness. Run AFTER Cluster C lands so real code shapes the decisions.

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

The 2 quick TS pre-locks (arrow-default, `type` default) are already in `docs/llm/coding-practices.md` § TypeScript.

### Controller error-throwing restructure (future round, not in #18–#36)

Per the user's flag during B2: controllers across `tasks` / `projects` / `labels` / `reminders` currently throw `EndpointError('NOT_FOUND', ...)` after a service returns `undefined`. Per ADR-0012 the service should throw `EntityNotFoundError` (or another `DomainError` subclass), and the controller should not catch / not re-throw HTTP-flavoured errors. Touches every controller's `*ById` / `update*` / `delete*` method plus every service method that currently returns `undefined` on miss. Will also let us drop the `EndpointError` import from controllers entirely. Separate round after Phase Z.

### Personal standards extraction (future)

Generic process/doc shape (CLAUDE.md hierarchy · grill-with-me protocol · docs convention · Pocock ADR format · glossary structure · coding-practices format · handoff lifecycle · behavior.md · pause-workflow rule) is portable. Backend ADRs 0008/0009/0012/0013/0014/0015/0018 + two-mode-parent-delete pattern are portable for any Hono/Node + DB project. Extract only when the next personal project starts so extraction is informed by real reuse pressure.

## Don'ts (carried over)

- **Never auto-commit** — user commits manually. Period.
- **Don't touch BetterAuth tables** — `users` · `sessions` · `accounts` · `verifications` schema columns are off-limits. ADR-0017 + glossary entry cover this.
- **Don't drop `users_projects`** — reserved scaffolding for future multi-user sharing. ADR-0020.
- **Don't add code snippets** to coding-practices entries.
- **Don't reintroduce granular PATCH endpoints** (`PATCH /tasks/:id/status` etc.) — they were intentionally dropped per ADR-0014.
- **Don't run git commands without permission**. Show diffs; let user commit.

## Open handoffs to clean up

- [`backend-grill-round1-complete-2026-05-18.md`](./backend-grill-round1-complete-2026-05-18.md) — **superseded by this handoff**. Safe to delete after this one is read.
- [`backend-grill-agenda-2026-05-16.md`](./backend-grill-agenda-2026-05-16.md) — round-1 paused snapshot, also superseded. Safe to delete.
- [`design-system-brainstorm-2026-05-14.md`](./design-system-brainstorm-2026-05-14.md) — superseded by `design-phase-complete-2026-05-14.md`. Safe to delete.
- [`design-phase-complete-2026-05-14.md`](./design-phase-complete-2026-05-14.md) — still relevant for frontend work; keep.
- [`phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md) — phase-1 dep upgrades record. Keep if any item still pending; otherwise delete.

User decides cleanup ordering.

## Plan file

`~/.claude/plans/init-this-is-a-humble-nova.md` — checklist reflects all completed clusters. Three future-todos remain:

- Phase Z · TS style grill round.
- Controller error-throwing restructure.
- Personal standards extraction.

Plan stays alive until fix phase (Cluster C) + Phase Z complete, then deletes alongside this handoff.

## Session memory (auto-loads in next chat)

- Pause-workflow = handoff doc, no commits (`feedback_pause_workflow`).
- No tailwind palette names — describe by hex + hue (`feedback_no_tailwind_names`).
- Vue/Nuxt leaning for next frontend — not in repo docs (`project_next_frontend`).
