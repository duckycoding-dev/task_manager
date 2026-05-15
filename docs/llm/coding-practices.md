---
created: 2026-05-14
updated: 2026-05-14
summary: Living code-style rules — how code is written in this repo. Populated organically as the Grill-with-me protocol resolves style decisions. Not a from-scratch style guide.
---

# Coding practices

Living document. Each rule below was agreed via the [Grill-with-me protocol](./behavior.md#grill-with-me--terminology-discipline) and is the canonical way code is written in this repo. Style rules that exist because of an [ADR](../stable/_shared/adr/README.md) cross-link to it.

This doc grows **only** when a real ambiguity surfaces and gets resolved. It is **not** a comprehensive style guide written upfront. If a section is empty, it means we haven't agreed a convention yet — flag inconsistencies you spot and we'll add the rule.

## How rules get added

1. Agent or human spots a style inconsistency in the codebase (two patterns for the same thing).
2. Grill-with-me kicks in. Caveman-style back-and-forth until canonical pick is clear.
3. Rule is added below in the matching section.
4. Future code follows the rule. Existing inconsistent code gets harmonized when touched.

## Sections

### TypeScript

*Pending grills. Examples of decisions that will land here as they're discussed:*

- Function form: when `function foo()` vs `const foo = () =>`.
- Casing: enforced by linter; rules captured here when they deviate from defaults.
- Export style: named vs default.
- `type` vs `interface`.
- Error pattern: throw vs Result.
- Import order: external / internal / type-only.
- Async: prefer `async/await` vs `.then` (most likely `async/await`).
- Nullish handling: `??` vs `||`.

### Vue / Nuxt *(populated when frontend implementation starts)*

- Composition API conventions.
- Single-file-component structure (`<script setup>` order: imports → props → emits → state → computed → methods → lifecycle).
- Composable naming (`useX`).
- Component naming (PascalCase filename; kebab-case in templates? agreed at the time).
- Refs vs reactive.
- Prop types and defaults.

### Backend (Hono / Drizzle / Zod)

*Pending grills. Examples:*

- Route file layout (per-feature directory pattern already documented in [`docs/stable/backend/architecture.md`](../stable/backend/architecture.md)).
- Zod schema location (in `*.types.ts` vs colocated with the route).
- Error pattern (already documented in [`docs/stable/backend/error-handling.md`](../stable/backend/error-handling.md) — copy out the canonical version when refining).
- Drizzle query style (chained vs object syntax).
- Migration naming.

### Shared (cross-cutting)

*Pending. Anything that applies regardless of backend/frontend.*

- Comment density (default = none unless WHY is non-obvious; documented in CLAUDE.md).
- TODO / FIXME / NOTE conventions.
- Date / time handling (UTC at the boundary, local for display).

## Format for a rule entry

When adding a rule, use this minimal shape:

```md
### {Short rule name}

{1–2 sentences: the rule itself + the rationale (why this over alternatives).}

**Do:**
\`\`\`ts
// canonical example
\`\`\`

**Don't:**
\`\`\`ts
// the rejected alternative
\`\`\`

*Cross-links*: link to the ADR if this rule traces back to one; link to glossary entries if naming is involved.
```

Don't over-engineer the format. A single sentence + one code block is fine when the rule is obvious enough.
