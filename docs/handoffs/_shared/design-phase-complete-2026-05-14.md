---
created: 2026-05-14
updated: 2026-05-14
summary: Design phase complete. All 6 v1 design docs landed + glossary + grill-with-me behavior. Captures uncommitted state, open handoffs to clean up, and the open question on ADRs/coding-styles vs backend planning ordering.
---

# Handoff — design phase complete (2026-05-14)

Pick up tomorrow from here. Design phase done; nothing committed yet. User will commit manually before deciding next-phase ordering.

## Done in this session (and prior sessions still uncommitted)

### v1 design phase — complete

All 6 docs landed under `docs/stable/_shared/design/`:

- [`01-tokens-and-theme.md`](../../stable/_shared/design/01-tokens-and-theme.md) — color/type/spacing/radius/elevation/motion/z-index/breakpoints/naming
- [`02-layout-and-navigation.md`](../../stable/_shared/design/02-layout-and-navigation.md) — shell anatomy, pinnable sidebar, mobile bottom nav + drawer, ⌘K command palette, GitLab-style detail panel, handedness preference, breakpoint behavior, keyboard shortcuts
- [`03-page-wireframes.md`](../../stable/_shared/design/03-page-wireframes.md) — Dashboard · Calendar · All tasks · Projects list · Project page (Z layout — tasks-only main + reminders rail) · Task detail (panel + dedicated page) · Inbox · Labels (3-tier delete) · Settings · Auth; cross-page surfaces (quick-add · auth-gated routing · skeleton · empty state)
- [`04-components.md`](../../stable/_shared/design/04-components.md) — every primitive: button / input / select / picker / date / color / badge / dialog / toast / popover / menu / tabs / breadcrumbs / tooltip / skeleton / empty state / shell parts / kanban card+column / reminder row / filter chip / form layout
- [`05-motion-and-behavior.md`](../../stable/_shared/design/05-motion-and-behavior.md) — surface motions, optimistic UI patterns with rollback rules, drag-to-status choreography, keyboard interactions, reduced-motion fallbacks per pattern
- [`backend-changes-summary.md`](../../stable/_shared/design/backend-changes-summary.md) — **consolidated checklist** of every 🟢/🟡/✅ change across all design docs. Has migrations (SQL **annotated as illustrative — actual migrations are Drizzle**, generated via `bun --cwd apps/backend run db:generateMigration`), endpoint extensions, cross-cutting patterns, deferred-work list, suggested implementation order.

Mockup HTML for every page lives under `.superpowers/brainstorm/103816-1778872719/content/`. Persistent; `.superpowers/` should be gitignored before committing.

### New process artifacts

- [`docs/llm/behavior.md`](../../llm/behavior.md) — added new **§ Grill-with-me · terminology discipline** section. Bumps `updated` to 2026-05-14.
- [`docs/stable/_shared/glossary.md`](../../stable/_shared/glossary.md) — **new file**, living glossary of domain terms, entities, UX concepts, backend concepts, workflow concepts. Seeded with entries from the design specs. Maintained via the Grill-with-me protocol going forward.

## Uncommitted state (everything)

Across this and prior sessions, three buckets of changes still sit in the working tree:

### Bucket A — Phase 1 dep upgrades (oldest)

Full details in [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md). One-line recap:

- 9 dep-group bumps across root + backend `package.json`s + bun.lock.
- Backend code touched: `apps/backend/src/index.ts`, `apps/backend/src/utils/logger.ts`, `apps/backend/tsconfig.json` (`ignoreDeprecations: "6.0"` shim).
- Doc additions: `docs/stable/_shared/dependency-upgrades-2026-05.md`, `docs/stable/backend/zod-schemas.md` (refreshed/un-flagged), root `CLAUDE.md` link annotation.
- Followup commits: react19 eslint-plugin bumps + eslint 9→10.

### Bucket B — Design phase (this session round)

- 6 new files under `docs/stable/_shared/design/`.
- `docs/stable/_shared/glossary.md` (new).
- `docs/llm/behavior.md` (Grill-with-me section added).
- `.superpowers/brainstorm/103816-…` mockup directory — **should be .gitignored**, not committed.

### Bucket C — Open handoffs to reconcile

- [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md) — **still active**. Bucket A above is its uncommitted work.
- [`./design-system-brainstorm-2026-05-14.md`](./design-system-brainstorm-2026-05-14.md) — **superseded by this handoff**. Its work (specs 01–02 + start of 03) is now covered by the full design landing. **Recommend deleting it** as part of cleanup; surfacing per `behavior.md` rule before doing so.

## Suggested commit grouping (you commit)

```
chore: gitignore .superpowers/ brainstorm artifacts
docs(design): add tokens & theme spec (01)
docs(design): add layout & navigation spec (02)
docs(design): add page wireframes spec (03)
docs(design): add components spec (04)
docs(design): add motion & behavior spec (05)
docs(design): add backend-changes-summary consolidating doc
docs: add glossary + grill-with-me behavior rule
docs(handoffs): close design-system-brainstorm pause point (or just delete it)
docs(handoffs): design phase complete + next-phase decision pending
```

Phase-1 commits separately per `phase-1-followup-2026-05-13.md`.

## Open question for next session — ADRs / coding-styles vs backend ordering

User flagged this explicitly: "maybe talking about ADRs and coding styles would be better before working on the backend? or maybe not — I'm super undecided."

### Three plausible orderings

| Order | Pros | Cons |
|---|---|---|
| **A · ADRs + lint/format port first, then backend** | Captures decisions upfront, backend refactor naturally adopts. Eslint/prettier port is mostly mechanical config — fast win. | ADRs about backend specifics (zod approach, drizzle conventions, route layering) are hard to write before touching the code. |
| **B · Backend planning + refactor first, ADRs as side product** | Backend is concrete + design relies on its changes. ADRs naturally crystallize from the decisions made during the refactor. | Decisions get made implicitly via code; harder to formalize after the fact. |
| **C · Interleaved · port lint/format first (mechanical), then backend with ADRs written as decisions firm up** | Pragmatic middle. Quick lint wins early; backend work generates ADRs as it goes. | More coordination overhead. |

My (LLM's) lean: **C**. Lint/format port = small, mechanical, blocks nothing; do it first. Backend refactor begins with the consolidated changes in `backend-changes-summary.md`; ADRs emerge naturally per major decision (drop `isRecurring`, soft-delete convention, multi-value filter API shape, two-mode label delete). Coding-style ADRs (Vue composition API conventions, file structure, error handling) can wait until the Vue scaffolding starts.

Not committed to that lean. Decide together next session.

## Carry-forward followups (deferred, not addressed in this session)

From phase 1 (`phase-1-followup-2026-05-13.md`):

- `apps/backend/tsconfig.json` `baseUrl` cleanup before TS 7.
- Redundant `extendZodWithOpenApi(z)` calls in 4 `*.types.ts` files.
- Schema-sharing architecture (pure zod schemas in a shared package).
- `apps/react19` non-eslint deps + `packages/utils` deps still pending.

From design phase (backend planning round):

- All 🟢 items in `backend-changes-summary.md` (migrations + endpoint extensions).
- All 🟡 items remain deferred (acknowledgedAt, position field, activity log, comments, notifications, import endpoints, server-side preferences).

## Resume checklist

1. Read this handoff first; cross-reference [`./phase-1-followup-2026-05-13.md`](./phase-1-followup-2026-05-13.md) for the phase-1 detail.
2. Decide on the [ADRs vs backend question](#open-question-for-next-session--adrs--coding-styles-vs-backend-ordering).
3. Add `.superpowers/` to `.gitignore`.
4. Commit per the suggested grouping (or your own).
5. Surface for cleanup: [`./design-system-brainstorm-2026-05-14.md`](./design-system-brainstorm-2026-05-14.md) is superseded — delete after confirming.
6. Begin the chosen next phase. Apply Grill-with-me from the first turn.

## Open user-context items (session memory, not in repo docs)

- User leans Vue/Nuxt for the upcoming frontend. `apps/react19` may not be continued past minimal upkeep.
- User has a "newer project" with eslint / prettier / zod patterns to port — needs to be shared at the start of the lint/format port work.
- User commits manually — never auto-commit (per `feedback_pause_workflow` memory).
- Pause workflow: write handoff doc covering state + next steps; no auto-commit (this handoff is the pause artifact).
