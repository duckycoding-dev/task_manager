---
created: 2026-05-13
updated: 2026-05-13
summary: Generic behavior rules for LLM agents working in this repo — communication style, planning/handoff/stable conventions, git/destructive-action policy, frontmatter contract.
---

# Agent behavior rules

This file is the editable surface for *how* LLM agents should work in this repo. It's linked from the root [CLAUDE.md](../../CLAUDE.md) — agents read it before doing substantive work.

The `docs/llm/` folder is reserved for LLM-meta docs; expect more files here over time (e.g. `coding-practices.md`).

## Communication style

- Be synthetic. Skip preambles, summaries-of-summaries, and conversation filler.
- Be objective. Don't tell the user they're right unless it's objectively true. Challenge assumptions when there's reason to.
- Don't narrate thought processes. Plans and design rationale belong in plan files, not in every chat reply. Explain reasoning when asked.
- Reference code by `path:line` when possible.

## Diagrams

Always use mermaid syntax for graphs. Never use ASCII-art diagrams.

## Clarifying questions

Ask follow-up questions when the topic is not fully defined. Don't guess large requirements. Small details where the right answer is obvious from the codebase don't need a question — but anything that determines design or scope does.

## Git & destructive actions

- Never run `git` commands unless the user explicitly asks or pre-authorizes.
- Same caution applies to other destructive/irreversible actions: `rm -rf` outside the workspace, force-push, dropping DB tables, etc.
- When in doubt, stop and ask.

## Planning

When a non-trivial task needs planning, write a plan file:

- Location: `docs/plans/<feature>/<slug>.md` — or `docs/plans/_shared/<slug>.md` for cross-cutting work.
- Body shape: Context (why), target outcome (what), step checklist using `- [ ]` / `- [x]`, references to existing files/code.
- Update the checkboxes as steps complete — keep the plan as the source of truth for in-progress work.
- Required frontmatter (see below).

## Handoffs

If work stops with anything incomplete, write a handoff file:

- Location: `docs/handoffs/<feature>/<slug>.md`.
- Body shape: what was done, what remains, current state of files/branches, the immediate next step, traps the next agent should know about.
- Lifecycle: handoff stays until the related plan completes; then it's deleted alongside the plan.

## Plan completion

When the work in a plan is fully done:

1. Delete the plan file.
2. Delete any related handoff files.
3. Create or update a **stable** doc at `docs/stable/<feature>/<slug>.md` capturing the durable knowledge produced by the work (architecture decisions, conventions established, gotchas).

This way `docs/plans/` and `docs/handoffs/` only ever show active work; `docs/stable/` is the long-term knowledge base.

## Feature buckets

Use these `<feature>` segments inside `docs/plans/`, `docs/handoffs/`, `docs/stable/`:

- Backend domain features: `tasks`, `projects`, `labels`, `reminders`, `auth` (match `apps/backend/src/features/*`).
- Backend-wide topics that aren't a single domain feature: `backend`.
- Frontend-specific: `react19` (and future `vue`, `next`, etc.).
- Monorepo-wide / cross-cutting: `_shared`.
- New buckets are fine when a new app or domain shows up.

## App-internal docs

`apps/<app>/docs/` and `packages/<pkg>/docs/` hold tool guides and gotchas relevant only to that workspace (e.g. `apps/react19/docs/daisyui.md`).

**Promotion rule:** when a second workspace adopts a tool/library whose doc currently lives under one app, move the doc to `docs/stable/_shared/<tool>.md` and update links from the consuming CLAUDE.md files. Don't duplicate.

App-internal docs are flat — they do not get their own `plans/`/`handoffs/`/`stable/` subtree. Plans and handoffs always live at the root `docs/`.

## Frontmatter contract

Every `.md` under `docs/`, every `apps/<app>/docs/*.md`, and every `CLAUDE.md` carries frontmatter:

```yaml
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
summary: <one-line description of contents>
---
```

- `created` is set once and never changes.
- `updated` must be bumped on every meaningful edit. Trivial typo fixes don't need a bump.
- `summary` is one descriptive line — it's what shows up in search/listing scripts and helps future agents decide whether to read the file.

## Plan/handoff cleanup discipline

- A merged feature whose plan still exists is a bug — delete the plan, create the stable doc.
- A stable doc with no matching feature in the code is a bug — verify or delete.
- If you find leftover plans or handoffs whose work is clearly done, surface them to the user before deleting.
