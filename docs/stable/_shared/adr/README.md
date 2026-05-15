---
created: 2026-05-14
updated: 2026-05-14
summary: ADR (Architecture Decision Record) convention for this repo. Adopts Matt Pocock's minimal format with our standard frontmatter layered on. Sequential numbering, located at docs/stable/_shared/adr/.
---

# ADR convention

ADRs (Architecture Decision Records) live in this directory: `docs/stable/_shared/adr/`. Each file = one decision. Sequential numbering: `0001-<slug>.md`, `0002-<slug>.md`, ….

An ADR records **that** a decision was made and **why**. The value is in the recording, not in filling out sections.

## When to write an ADR

All three of these must be true (Matt Pocock's criteria):

1. **Hard to reverse** — the cost of changing your mind later is meaningful.
2. **Surprising without context** — a future reader will look at the code or docs and wonder "why on earth did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and we picked one for specific reasons.

If a decision is easy to reverse, skip it — you'll just reverse it. If it's not surprising, nobody will wonder why. If there was no real alternative, there's nothing to record beyond "we did the obvious thing."

### What qualifies

- **Architectural shape.** Monorepo layout. "Backend uses Hono + Drizzle + Postgres + BetterAuth." "Inline detail panel + dedicated page share one component."
- **Integration patterns between contexts.** "Frontend talks to backend via Hono RPC, not raw fetch."
- **Technology choices that carry lock-in.** Database, message bus, auth provider, framework. Not every library — only the ones that would take weeks to swap out.
- **Boundary and scope decisions.** "Projects are user-owned in v1; the `users_projects` table exists but isn't surfaced in UX yet."
- **Deliberate deviations from the obvious path.** "Calendar item clicks navigate to the dedicated page (NOT the inline panel that the rest of the app uses) because calendar is a navigation lens, not a working surface."
- **Constraints not visible in the code.** Compliance, performance contracts, deadlines.
- **Rejected alternatives when the rejection is non-obvious.** If we considered JSON-encoded predicates and picked array params for filtering, record it.

### What does NOT belong here

- Mechanical style rules (function form, casing, imports). Those go in [`docs/llm/coding-practices.md`](../../llm/coding-practices.md).
- Naming choices for an entity / field / function. Those go in [`docs/stable/_shared/glossary.md`](../glossary.md).
- Decisions made and reversed within the same session (transient — not architectural).
- Decisions that just record "we did the obvious thing".

## Template

```md
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
summary: {One-line of the decision}
status: accepted   # optional · proposed | accepted | deprecated | superseded by NNNN
---

# {Short title of the decision}

{1–3 sentences: what's the context, what did we decide, and why.}
```

That's it. An ADR can be a single paragraph. The value is in recording the decision — not in filling out sections.

## Optional sections

Only include these when they add genuine value. Most ADRs won't need them.

- **Status** in frontmatter — useful when decisions are revisited (`proposed | accepted | deprecated | superseded by 0007`).
- **Considered Options** — only when the rejected alternatives are worth remembering.
- **Consequences** — only when non-obvious downstream effects need to be called out.

## Numbering

Scan `docs/stable/_shared/adr/` for the highest existing number and increment by one. Filename pattern: `NNNN-<short-kebab-case-slug>.md`. Slugs are descriptive, not cute (`0002-soft-delete-via-deletedat.md`, not `0002-the-deleted-pattern.md`).

## Cross-linking

ADRs commonly relate to:

- A [glossary](../glossary.md) entry — when the decision pins a canonical name.
- A [coding-practice](../../../llm/coding-practices.md) rule — when the decision implies a code-style rule.
- Other ADRs — when one decision builds on or supersedes another.

Use markdown links so navigation is one click.

## How to evolve an ADR

ADRs are **append-only in spirit**:

- A decision can be **superseded** by a newer ADR. The older one stays in place; its frontmatter is updated to `status: superseded by NNNN` and the body left intact (don't rewrite history).
- Small corrections (typo, broken link) are fine in-place; bump `updated:`.
- Substantive changes-of-mind get a new ADR.

## Why not `docs/adr/` at the top level?

Matt Pocock's convention is `docs/adr/`. We use `docs/stable/_shared/adr/` instead because our docs tree already nests every long-term knowledge artifact under `docs/stable/_shared/`. Keeps the top-level tree consistent. The convention is otherwise identical.
