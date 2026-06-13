---
created: 2026-05-14
updated: 2026-05-19
summary: Living code-style rules — how code is written in this repo. Populated organically as the Grill-with-me protocol resolves style decisions. Rules describe behavior + intent, not code snippets (those rot).
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

#### Arrow functions default for module-level definitions

Module-level function definitions use the **arrow form** (`export const foo = (x: number) => …`) as the default. The `function` keyword is reserved for cases where it earns its existence: (1) hoisting is genuinely needed (rare in module-level code — most modules read top-to-bottom), (2) generators and async generators (`function*` / `async function*` — the only available syntax), (3) methods inside classes / object literals (already required there), (4) when self-reference for recursion is clearer with the name binding from the declaration. Rationale: consistency across the codebase, simpler `const` discipline, no temporal-dead-zone confusion from intra-module hoisting. Stack-trace quality is a non-issue with modern V8 — arrow functions assigned to a `const` show the variable name. Inferred return types stay; explicit return types only when the boundary contract warrants them or inference produces something wrong.

#### `type` default, `interface` only when extension is needed

Use `type` aliases as the default for shaping object/value types. `interface` is reserved for the two cases where it does something `type` can't: (1) declaration merging (module augmentation — extending library types, e.g. `declare module 'hono' { interface ContextVariableMap { … } }`), (2) public-API surfaces that downstream consumers are *expected* to extend via `interface X extends Y`. For everything else — domain models, props, function signatures, discriminated unions, mapped/conditional types — `type` is strictly more capable (unions, intersections, primitives, tuples, computed keys all work) and reads uniformly. Don't waver between the two within the same file; if a type starts as `type` and later needs declaration-merging, convert it deliberately rather than mixing styles.

#### Casing rules

Casing is fixed per identifier kind. The picks below are the canonical form; the linter does not currently enforce them (`@typescript-eslint/naming-convention` is not wired) so they live as documented discipline until the ESLint/Prettier/Husky pass adds enforcement.

| Identifier kind | Casing | Example |
|---|---|---|
| Variables, function parameters, methods, function-valued module consts (arrow exports), Hono/Drizzle/Zod runtime instances (`app`, `db`, `logger`) | `camelCase` | `getTaskById`, `selectTaskSchema`, `app` |
| Types, interfaces, classes, type aliases (including those inferred from Zod via `z.infer`) | `PascalCase` | `Task`, `EndpointError`, `DomainError` |
| Module-level frozen data consts — `as const` arrays / lookup tables, primitive literals, `Object.freeze({...})` maps, `as const satisfies …` registries | `SCREAMING_SNAKE_CASE` | `STATUS_OPTIONS`, `AUTH_CTX_KEYS`, `DOMAIN_ERROR_MAP`, `MAX_RETRIES` |
| Zod schema module exports | `camelCase` + `Schema` suffix (no PascalCase variant) | `selectTaskSchema`, `labelIdParamSchema`, `taskInsertSchema` |
| Files (`.ts` / `.tsx`) | `kebab-case` | `create-app.ts`, `auth-context.ts`, `http-errors.ts` |
| Directories | `kebab-case` (locked even for hypothetical multi-word dirs: `task-labels/`, not `taskLabels/`) | `apps/backend/`, `task-labels/` (when it appears) |
| Route URL segments (path segments excluding params) | `kebab-case` | `/export/preferences`, `/recurring/toggle` (when retained) |
| Route path params and query-string keys | `camelCase` | `:taskId`, `:labelId`, `?includeDeleted=true` |
| DB tables | `snake_case` plural | `tasks`, `task_labels`, `users_projects` |
| DB columns (Postgres) → Drizzle TS field | `snake_case` → `camelCase` | `recurring_interval` → `recurringInterval`, `user_id` → `userId` |
| Env vars | `SCREAMING_SNAKE_CASE` | `DATABASE_URL`, `LOG_LEVEL` |
| Domain enum string literal members (`tasks.status`, `tasks.priority`, `tasks.recurringInterval`, etc.) | `snake_case` by default; single-word lowercase reads as snake_case of length one (`'todo'`, `'done'`); a per-field deviation is allowed only when a different convention is intrinsic to the field's domain (e.g. HTTP verbose codes) **and documented at the field's declaration** | `'in_progress'`, `'todo'`, `'high'`; HTTP-shaped literals stay as their library convention (`'NOT_FOUND'`, `'OK'`) |

Cross-cutting standards that already carry their own well-known convention (HTTP status verbose codes, env vars from third-party services, library types from external packages) keep that convention. Note the carve-outs above: schemas stay camelCase, runtime instances stay camelCase, function-valued module consts stay camelCase (per the arrow-default rule). The SCREAMING_SNAKE_CASE bucket is for *data* consts only, never for callables or stateful instances. Files / directories are kebab-case unconditionally — no `index.ts` exception, no `PascalCase.tsx` exception (component files are still kebab-case; the exported identifier inside is `PascalCase`).

#### Named exports default; `export default` only when an external API mandates it

Module-level exports use the **named form**. `export default` is reserved for cases where a third-party contract requires it: the Bun/Node fetch-server contract (`export default { port, fetch }` in `src/index.ts`) is the canonical example. Stylistic / habitual default exports (e.g. `export default env`, `export default xRouter`) are not allowed — they lose grep-ability of the bound identifier across the codebase, weaken auto-import suggestions (the IDE may import the same value under two different local names at different sites), and force consumers to choose an arbitrary local alias. Named exports keep the identifier identical at the declaration site and at every consuming site. Mechanical renames implied: `src/utils/env.ts` drops `export default env` in favour of `export const env`; each `*.router.ts` switches `export default xRouter` to `export const xRouter` (Hono's `app.route(path, router)` is agnostic to default vs named).

#### `extendZodWithOpenApi(z)` registered once via `utils/openapi-extension.ts`; `*.types.ts` stays pure Zod

`@hono/zod-openapi`'s `.openapi()` method is grafted onto `ZodObject.prototype` by a one-time call to `extendZodWithOpenApi(z)`. The call must execute **before any `*.routes.ts` module-init runs** — `.openapi()` chains in those route files are invoked at import-time (inline `selectXSchema.openapi(...)`), so the prototype must already be mutated by then.

Register the call exactly **once**, inside a dedicated module: `apps/backend/src/utils/openapi-extension.ts`. The file imports `extendZodWithOpenApi` + `z`, calls `extendZodWithOpenApi(z)` at module-top, and exports nothing. It is loaded via a **side-effect-only import** (`import './utils/openapi-extension';`) at the very top of the per-app entry (`apps/backend/src/index.ts`), placed before `import { app } from './app'`. The side-effect-import form sorts to group 1 of `simple-import-sort` (the side-effect bucket) so import-sort never reorders it past the `./app` import. Entry files are the only place side-effect-only imports are allowed by the side-effect-imports rule below.

Why a dedicated module + side-effect-import rather than placing the call inside `createApp()` or at the top of `create-app.ts`: route files are imported at the top of `app.ts` (before `createApp()` is ever called), so a function-body placement runs too late. Co-locating the registration with `create-app.ts` works structurally only if `app.ts` imports `create-app.ts` before every router — but `simple-import-sort` alphabetizes the import block and the order isn't stable. A dedicated module + side-effect-import in the entry sidesteps both issues.

`*.types.ts`, `*.db.ts`, `utils/create-app.ts`, and every other non-entry, non-extension module must **not** import `extendZodWithOpenApi` or call it. Schemas in `*.db.ts` / `*.types.ts` are constructed with plain `zod/v4`. `.openapi()` chains live only in `*.routes.ts`, where `@hono/zod-openapi` is already imported for `createRoute` / `z`. Consequence: `*.types.ts` becomes part of the FE-safe import graph (no `@hono/zod-openapi` leak through public-API barrels). Whether to actually re-export `*.types.ts` symbols via the barrel is a separate decision — this rule just removes the bundle obstacle.

#### Barrels: public-API only (Pattern B)

A barrel file (re-export-only `index.ts`) is allowed **only** as the cross-package public-API boundary — i.e. when the file is referenced from `package.json` `exports`. Internal-only convenience barrels are forbidden (no `src/utils/index.ts`, no `src/features/index.ts` re-exporting features for backend-internal use). Internal code imports siblings via deep paths.

Rationale: barrels at the package boundary encapsulate the public surface and let internal layout evolve without breaking external imports. Internal barrels add cycle risk, hide module-eval cost, and create IDE auto-import drift (the same symbol imported via deep path from some files and via barrel from others) — costs with no offsetting benefit since the deep path is short anyway.

Allowed re-export sources are restricted to `*.db.ts` and `*.types.ts`. Server-only modules — `*.routes.ts`, `*.controller.ts`, `*.service.ts`, `*.repository.ts` — are forbidden as barrel sources because they pull `@hono/zod-openapi` route runtime, the Drizzle client (and via it the `postgres` driver), service-layer dependencies, or auth runtime, none of which belong in an FE bundle. The `*.types.ts` source is safe **only** because the `extendZodWithOpenApi(z)` registration was moved to `createApp()` (see rule above) — without that move, `*.types.ts` would have leaked `@hono/zod-openapi`. If the feature layout is ever consolidated (e.g. merging `*.db.ts` and `*.types.ts` into a single `*.schemas.ts` file), the rule transfers cleanly: the merged file remains barrel-safe as long as it stays on pure `zod/v4` + drizzle-zod and never imports route/service/controller/repository modules.

Re-export form: **explicit named lists** (`export { a, b, c } from './x'`); `export * from './x'` is banned. The explicit-list cost (every barrel addition is a deliberate edit) is the *feature* — surfacing the public-API decision at the point a symbol crosses the boundary. Star re-exports hide which symbols are exposed, silently propagate future additions of internal helpers, and break grep-by-symbol-name across the barrel layer. Types are re-exported via the dedicated `export type { ... } from './x'` form (required by `verbatimModuleSyntax` / `isolatedModules`); mixing value and type re-exports in a single `export { ... }` statement is not allowed.

Internal-consumer discipline: code inside `apps/backend/src` imports siblings via deep paths (`./tasks.db`, `./tasks.types`), **never** through its own feature barrel (`./`, `./index`, `../tasks`). The barrel exists for cross-package consumers only. Rationale: avoids cycles created when an internal file transitively imports the file that re-exports it; keeps the barrel's role unambiguous as the package boundary; eliminates IDE auto-import drift where the same symbol arrives via two different paths across files. Planned enforcement (deferred to the ESLint/Prettier/Husky pass): an `import/no-restricted-paths` zone targeting `./apps/backend/src` with `from: './apps/backend/src/features/*/index.ts`. The rule matches resolved file paths, not import specifiers, so it catches every form (`./`, `./index`, `../tasks`, etc.) without enumerating specifiers. Carve-outs to consider at wiring time: tests that exercise the public surface (none today), and `hc.ts`-style build-time helpers that may legitimately need the assembled barrel.

External-consumer contract: when *any* package outside `apps/backend` (the FE, a future scripts/CLI package, a second FE) needs a symbol from the backend, it imports via the `package.json` `exports` map only — `@task-manager/backend/<subpath>` resolves to the barrel emitted under `dist/`. Deep-pathing into `apps/backend/dist/**` or `apps/backend/src/**` from outside the package is forbidden. The `exports` map *is* the contract; the barrels behind it are the only public surface. If an external consumer needs a symbol the barrel doesn't currently expose, the fix is a deliberate barrel edit (and possibly a new `exports` subpath), not a deep-path workaround.

#### Side-effect-only imports + boot-time top-level side effects

A **side-effect-only import** is the form `import './foo'` with no specifier list — the module is loaded purely to execute its top-level code. The bundler and reader have no symbol to track, so the dependency is invisible at the call site. Rule:

- **Allowed at app entry** (`apps/backend/src/index.ts`, `apps/react19/src/main.tsx`, future per-app entries): polyfill installs, framework init modules, etc. Entry is the legitimate seam for one-time process setup.
- **Allowed for bundler-required asset imports** (`import './x.css'`, `import './logo.svg'` in FE code): these have no JS symbol; the import statement is the bundler signal to emit/link the asset. Live wherever the asset is consumed.
- **Banned everywhere else**: don't sprinkle `import './register-x'` across feature modules; surface the side effect as an exported `initX()` function called explicitly from entry, OR — when the side effect must run at module-init *before* downstream modules are evaluated (prototype-extension case) — place it at the top of a foundational module that gets imported first in the chain. The `extendZodWithOpenApi(z)` registration in `create-app.ts` is an example: it's a module-top statement, not a function call.

A **top-level side-effecting call** is a non-import statement at module scope that mutates global state, performs IO, or registers a prototype extension. Rule:

- **Banned by default in feature/utility modules**. Wrap the effect in an exported function and call it from entry (or, for prototype-extension cases that must run before downstream modules evaluate, place it at the top of a foundational module that loads first — see the `extendZodWithOpenApi(z)` rule above for the canonical example, which lives at module-top of `create-app.ts`, not inside any `*.types.ts`).
- **Allowed in clearly-marked boot modules** — modules whose entire purpose is process-level boot (e.g. `apps/backend/src/utils/env.ts`, which parses `process.env` at import, exits on failure, and prints a confirmation). Such modules carry a comment at the top identifying them as boot modules and explaining why the top-level form is intentional. Treat the boot-module carve-out as rare: today `env.ts` is the only example, and growing the list should require justification. If a second boot module starts to feel necessary, revisit toward a stricter "no top-level side effects" stance with explicit `loadX()` functions called from entry.

Verified bundle impact in the current setup (build scan of `apps/react19/dist/assets/` on 2026-05-19, recorded before the `extendZodWithOpenApi` move): when the FE value-imports a Zod schema via a public-API barrel (e.g. `import { selectTaskSchema } from '@task-manager/backend/tasks'`), Vite/Rollup tree-shakes `drizzle-orm/pg-core` (the `pgTable` builder) and the `postgres` driver entirely — they don't appear in the emitted bundle. `@hono/zod-openapi` also stayed out at scan time (the barrel re-exported only from `*.db.ts`, never from `*.types.ts`). The `drizzle-zod` runtime does remain because the schema-building factories are referenced by the emitted Zod schemas. Type-only imports (`import type { Task } …`) cost zero — erased by TypeScript before emit. The pending widening to also expose `*.types.ts` is bundle-safe post-move; re-scan the FE bundle once Vue/Nuxt ships to confirm no regression.

**Temporary state**: keeping Pattern B with `drizzle-zod` reaching the FE bundle is acceptable while only one FE site value-imports a schema and the resulting bundle weight is small. The intended longer-term improvement is a codegen step (Option 5 from the source-of-truth analysis): keep Drizzle as the single source of truth, emit pure-Zod schemas (no `drizzle-zod` dependency) into a separate package the FE imports from. Tracked in [`docs/handoffs/_shared/backend-fix-phase-complete-2026-05-19.md`](../handoffs/_shared/backend-fix-phase-complete-2026-05-19.md) §2; trigger when Vue/Nuxt FE adds more value imports, measured bundle exceeds ~50KB of drizzle-zod chain, or dev-mode cold-start becomes noticeable (dev mode does not tree-shake).

#### Import order — auto-sorted into seven groups

Imports are auto-ordered by `simple-import-sort` (enforced via `simple-import-sort/imports` in `eslint.config.mjs`). The groups, in order:

1. Side-effect imports (`import './polyfill'`, init modules). Non-CSS only — CSS side-effect imports sort to group 7.
2. External packages — Node built-ins (`node:*`) first, then everything else; pure alphabetical with no anchor list.
3. Monorepo workspace packages (`@task-manager/*`).
4. Path aliases — react19 `@/` and backend bare-name aliases (`utils/`, `types/`, `src/`) sort together in one bucket (the two never co-occur per file).
5. Relative parent (`../...`).
6. Relative sibling (`./...`) — non-CSS.
7. CSS tail bucket — two subgroups: plain / side-effect CSS first (`*.css`, `*.scss` not preceded by `.module`); CSS Modules second (`*.module.css`, `*.module.scss`).

`simple-import-sort` alphabetizes within each group/subgroup. CSS cascade control belongs in CSS-land (CSS Layers or single-root-CSS with `@import` chain), NOT in JS-import ordering — relying on JS-side import order for CSS cascade is fragile because the linter will alphabetize. Reach for the `// eslint-disable-next-line simple-import-sort/imports` escape hatch only when neither CSS Layers nor single-root-CSS pattern is viable, and document the WHY at the disable site.

#### Nullish fallback uses `??`, never `||`

Use the nullish coalescing operator `??` for "fallback when value is `null` or `undefined`". The logical OR `||` falls back on **any falsy value** — `0`, `''`, `false`, `NaN` — which is almost never the intended semantics for "missing". The classic footgun is `count || 10` returning `10` when `count` is `0`; `count ?? 10` returns `0` correctly.

`||` remains correct for genuine boolean conditionals (`a === null || b === undefined`, `isAdmin || isOwner`). The rule is about *fallback semantics* (left side is a value, right side is its default), not about boolean composition.

Enforced via `@typescript-eslint/prefer-nullish-coalescing` (type-aware rule — wired in the per-app blocks where `projectService` is enabled). The rule fires on fallback `||` whose left operand can be nullish AND falsy-non-nullish (e.g. `number`, `string`, `boolean`); pure-boolean `||` is left alone.

#### `null` at external boundaries, `undefined` internally

Use `undefined` for "missing" / "absent" / "optional" everywhere inside application code. Use `null` only at boundaries where an external contract demands it: Postgres rows (drizzle returns `null` for nullable columns + missed JOINs), BetterAuth's session surface (`Session.user | null` when unauthenticated), and JSON-response shapes where the wire contract explicitly carries `null` (e.g. the empty-payload `data: null` per [`docs/stable/backend/responses.md`](../stable/backend/responses.md)).

The conversion happens at the seam. `nullsToUndefined()` at `apps/backend/src/utils/mapping.ts` recursively replaces `null` → `undefined` on the way out of the repository. New repos and integration clients should invoke it (or an equivalent) at exit so service / controller / FE code never sees `null` from internal layers.

Type-level: prefer the optional sugar `field?: T` (which is `T | undefined`) over explicit `field: T | null`. Use `T | null` only when the value actually arrives as `null` from a boundary (i.e. before `nullsToUndefined()` runs, or in BetterAuth/Hono-context-shaped types that the boundary contract demands).

No ESLint rule cleanly enforces "no `null` outside boundaries" (the AST-level options can't distinguish boundary code from internal code). Rule lives as documented discipline + review.

#### Zero `any` — use `unknown` and narrow

`any` is banned. Default to `unknown` for values whose shape isn't yet narrowed, then refine with type guards / Zod parses / `instanceof` / `in` checks before use. `unknown` forces narrowing at the consumer site, which is the whole point — `any` silently propagates through expressions, losing every downstream type check.

Rare legitimate exceptions:
- Deeply recursive generic gymnastics where TS can't infer the recursion (e.g. the `nullsToUndefined` utility in `apps/backend/src/utils/mapping.ts`).
- Third-party APIs that themselves type a parameter as `any` and we have no narrower contract.

At those sites, use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` with a one-line WHY comment explaining why `unknown` can't express the constraint. The comment makes every exception visible at the site + demands justification.

Note: this rule covers the TypeScript *type* `any`. The runtime Zod expression `z.any()` is unrelated — it's a Zod schema for "any value" and is the right primitive when the schema deliberately doesn't constrain (e.g. error `cause` field). `z.any()` does not trigger the rule.

Enforced via `@typescript-eslint/no-explicit-any: 'error'` (was `warn` during the config-merge transition; tightened with this rule).

#### `as const` for literal narrowing; combine with `satisfies` for shape checks

Use `as const` to narrow a value to its literal type — both for object literals (lookup tables, registries) and tuples (option arrays). Do NOT write the equivalent explicit literal annotation (`const X: { readonly a: 1 } = { a: 1 }`); it says the same thing as `as const` with twice the keystrokes and worse inference on nested members.

When the value must conform to a wider shape contract (the keys are constrained to a known type, the entries follow a registry schema), combine with `satisfies`: `const DOMAIN_ERROR_MAP = { ... } as const satisfies Record<string, DomainErrorRegistryEntry>`. The `satisfies` clause verifies the wider shape at the declaration site without widening the inferred type — readers see the narrow literal type AND get a compile error if a member drifts from the contract.

Established sites: `STATUS_OPTIONS` / `PRIORITY_OPTIONS` / `RECURRING_OPTIONS` (tuple-literal `as const`), `AUTH_CTX_KEYS` (object-literal `as const`), `DOMAIN_ERROR_MAP` (`as const satisfies …`).

No ESLint rule cleanly enforces this preference (the AST options for it are noisy on legitimate non-literal `const` bindings). Lives as documented discipline + review.

#### Discriminator name: `kind` by default; domain-specific name when it reads naturally

When a new discriminated union needs an explicit discriminator field, name it `kind` by default. `kind` is the TypeScript-handbook-canonical name and avoids the IDE / search noise that `type` causes (`type` is a TS keyword, a React JSX prop, and a common variable name).

Override `kind` with a domain-specific name when the field's *meaning* names it better:
- `Result<T, E>` at `apps/backend/src/utils/safe.ts` uses `ok: boolean` — the boolean directly carries the success/failure semantics, no separate `kind` needed.
- Finite state machines can use `state: 'idle' | 'loading' | 'ready' | 'error'`.
- Domain events can use `event: '...'`.

The rule: domain-specific is allowed when it improves readability at the consumer site; `kind` is the fallback when no domain term is obvious.

No ESLint rule enforces this (purely a naming convention). Lives as documented discipline + review.

#### `readonly` selectively — class fields enforced, `as const` for literals, params at author's judgment

`readonly` is a compile-time-only marker (no runtime guarantee). Use it where it expresses real intent + catches accidental mutation, NOT as a blanket policy. Three categories:

- **Class instance fields set once in the constructor, never reassigned by any method** → `readonly` is the default. Enforced by `@typescript-eslint/prefer-readonly` (type-aware rule, wired in the per-app blocks). Auto-applies to private/protected fields that are only assigned in the constructor. The existing error classes (`AppError`, `DomainError` subclasses at `apps/backend/src/utils/errors/{http,domain}-errors.ts`) already follow this.
- **`as const` literal data** → implicitly deep-readonly via the `as const` assertion. No additional `readonly` annotations needed (`STATUS_OPTIONS`, `AUTH_CTX_KEYS`, `DOMAIN_ERROR_MAP` are deep-readonly already).
- **Function parameters of object/array type** → opt-in `readonly` on a per-function basis. Mark when at least one is true: (1) the parameter accepts an `as const` literal from a caller and TS would otherwise reject it; (2) the function is pure-utility and the readonly annotation documents the no-mutation contract; (3) the function distinguishes a "sort in place" vs "return a sorted copy" pair. Don't blanket-apply — Zod-inferred / Drizzle-inferred types arrive mutable, and forcing readonly params forces friction at every callsite.

Domain types inferred from Zod (`z.infer<typeof selectTaskSchema>` → `Task`, etc.) and Drizzle row types stay mutable. The ecosystem produces mutable inference; adding `DeepReadonly<>` wrappers gives no real correctness benefit (TypeScript's structural typing lets a non-readonly alias mutate through the back door anyway) and costs ergonomics everywhere.

No general "readonly-everywhere" rule. `prefer-readonly` catches the cheap-win class-field case; everything else is documented discipline + review.

#### Async iteration — parallel by default, `for…of` only when dependencies / ordering / rate limits require it

For N async operations on a list, the default is `await Promise.all(items.map(item => asyncFn(item)))` — operations start together, the function awaits all of them, errors bubble. Use `for…of` only when:

1. Each operation depends on the prior result (sequential by necessity).
2. Ordering of side effects matters (writes that must serialize).
3. Concurrency must be limited (rate-limited third-party API, DB pool exhaustion, etc.). For bounded concurrency use a chunked-`Promise.all` over batches of N, or a queue helper — not naive `for…of` which serializes to concurrency 1.

`.forEach(async ...)` is banned everywhere. The callback returns a `Promise` that `Array.prototype.forEach` discards: outer code doesn't wait, errors are swallowed, async sequencing breaks silently. Use `for…of` (sequential) or `Promise.all(items.map(...))` (parallel) instead.

Enforced via type-aware rules: `@typescript-eslint/no-floating-promises` catches unawaited promises in general; `@typescript-eslint/no-misused-promises` catches `.forEach(async ...)` (mismatched promise-returning callback passed to a void-callback API) plus `if (asyncFn())`, `[].filter(async x => …)`, and similar shape errors. Both rules go in the per-app blocks where `projectService` is enabled.

#### Module-level `const`/`function` for utilities; classes only when actually instantiating

Group related stateless helpers as module-level `export const` arrow functions (or `export function` per the cases earlier in this doc — see §"Arrow functions default for module-level definitions"). Classes are reserved for the cases where they earn their existence: instance state, `instanceof`-checked types (error subclasses), subclassing, prototype-based polymorphism.

Banned: the "namespace class" pattern (`class Utils { static foo() {} static bar() {} }`). It adds zero runtime value over `export const foo = …`, breaks tree-shaking (bundlers can't drop unused static methods from a class), forces consumers to write `Utils.foo()` instead of importing `foo` directly, and creates a meaningless instance type that can't be instantiated meaningfully.

Established sites: error classes (`AppError`, `DomainError` + 7 subclasses at `apps/backend/src/utils/errors/`) — all instance-state classes used for `instanceof` checks in the error handler. Everything else — `formatZodError`, `nullsToUndefined`, `safe`, `cn`, etc. — is module-level `const` / `function`.

No ESLint rule cleanly enforces this (the only proxy is `@typescript-eslint/no-extraneous-class` which catches the most-egregious case — a class with only `static` members and no constructor — and is currently not wired). Lives as documented discipline + review.

#### Pending grills
- Error pattern at app boundaries: throw vs `Result` (backend rule already locked — pattern α + `safe()` at recovery sites; TS-general rule TBD).
- Async: prefer `async/await` vs `.then` (most likely `async/await`).
- `null` vs `undefined` policy.
- `unknown` vs `any` (assume zero `any`; lock the rule).
- `const` assertion vs explicit literal type.
- Discriminated-union discriminator name (`kind` vs `type`).
- `readonly` defaults on type members.
- For-of vs `.map(await)` for async iteration.
- Module-level `const` vs class with static methods.

### Vue / Nuxt *(populated when frontend implementation starts)*

- Composition API conventions.
- Single-file-component structure (`<script setup>` order: imports → props → emits → state → computed → methods → lifecycle).
- Composable naming (`useX`).
- Component naming (PascalCase filename; kebab-case in templates? agreed at the time).
- Refs vs reactive.
- Prop types and defaults.

### Backend (Hono / Drizzle / Zod)

#### Layer responsibilities

Backend uses 4 layers — controller, service, repository, integration client. Each has a single responsibility. See [ADR-0008](../stable/_shared/adr/0008-backend-layer-model.md) for the model.

- **Controller** (per-feature `*.controller.ts`): HTTP boundary only. Consumes validated input from the route schema, calls exactly one service method, formats the response. No business rules, no orchestration. Authentication is enforced by middleware (`addAuthMiddleware`, `checkAuthMiddleware`); fine-grained authorization (per-resource ownership / permissions) belongs in the service, not the controller.
- **Service** (per-feature `*.service.ts`): business / domain logic, orchestration of repositories and integration clients, fine-grained authorization (can THIS user perform THIS operation on THIS resource), transactions, derived data, cross-feature side effects. Methods aim to be **deep modules** — simple interface, non-trivial implementation. Format-agnostic — returns plain values.
- **Repository** (per-feature `*.repository.ts`): access to one DB table primarily. May JOIN related tables when those joined entities form the natural hydrated read shape of the primary entity. Must NOT write to tables it doesn't own. Returns Zod-validated data at the module boundary (see "Repository validates on exit" below).
- **Integration client** (`src/lib/integrations/<service>/<service>.client.ts`): typed wrapper around a 3rd-party SDK or fetch. Exposes a domain-friendly API (not a thin SDK passthrough). Validates inbound data with Zod. Handles retries, backoff, auth-token refresh, translation of vendor errors to domain errors. Lives outside `features/` because it's cross-cutting infra. Services treat clients and repositories as peer "data sources". *(No integration clients exist yet; rule lives here for when the first one is added.)*

#### Controller calls exactly one service method per request

The controller body is HTTP-thin: parse validated input, call one service method, format the response. Why: orchestration belongs in the service so it stays reusable from non-HTTP entry points (CLI, scheduled jobs, second API surface) and so the controller can be unit-tested with a single mocked dependency. The only allowed exception is **purely additive reads with zero shared logic between the parts** (e.g. an aggregate endpoint returning multiple independent collections side-by-side). The moment any `if` or derived data crosses the parts, the orchestration moves into a master service method.

#### Pass-through service methods are OK within a feature

Within a feature, the flow is uniform: `controller → service → repo`, always, even when the service method does nothing but forward the call. The uniform shape makes future logic insertions cheap (you don't refactor call sites later) and the controller layer stays a stable HTTP boundary. Pass-through is only banned **across features** (see next rule).

#### Cross-feature reads call the repo; cross-feature writes call the service

When feature X needs data from feature Y, it calls `yRepository.findX(...)` directly — no detour through `yService`. When feature X needs to perform an operation on feature Y (mutate it, or read it under policy), it calls `yService.x(...)` so business rules and side effects are enforced. Feature dependencies form a DAG; cycles are a refactoring signal, not a workaround. See [ADR-0009](../stable/_shared/adr/0009-cross-feature-call-rules.md).

#### Repository validates data on exit

Every repository method that returns data to the service layer validates the result against the canonical Zod schema before returning. Failures throw `RepositoryValidationError` (`src/utils/errors/domain-errors.ts`), which the global error handler converts to a 500 with full cause logged in development. Internal-to-repo composition reads (intermediate queries that don't leave the module) don't need to revalidate. Rationale + alternatives in [ADR-0010](../stable/_shared/adr/0010-repository-validates-on-exit.md).

#### Repository may JOIN for the entity's natural hydrated read shape

A feature's repository may include JOINs against related tables when those joined entities are part of the primary entity's natural representation (e.g. tasks-with-their-labels-and-reminders). The repository must NOT write to those foreign tables — writes touching multiple tables belong in the service layer with an explicit transaction.

#### Error propagation: throw + bubble; no try/catch in controllers

Service and repository layers throw `DomainError` subclasses at the origin of the error. Errors propagate upward without intermediate try/catch and are caught by the single global handler, which maps the error class to an HTTP response via a typed registry (`DOMAIN_ERROR_MAP`). Controllers contain no try/catch. The 7-subclass taxonomy (`EntityNotFoundError`, `ValidationError`, `BusinessRuleViolationError`, `ConflictError`, `ForbiddenError`, `AuthenticationError`, `RepositoryValidationError`) is documented in [ADR-0012](../stable/_shared/adr/0012-error-propagation-pattern.md). Adding a new subclass requires adding a registry entry — forgetting it falls through to 500.

#### Service / repository never throw `AppError`

`AppError<TCode>` is HTTP-flavored and reserved for layers that are inherently in an HTTP context: middleware (auth, rate limit, CORS), the `@hono/zod-openapi` `defaultHook` for route-schema validation failures. Service and repository layers throw `DomainError` subclasses — they're format-agnostic per [ADR-0008](../stable/_shared/adr/0008-backend-layer-model.md) and must stay reusable from non-HTTP entry points.

#### `EndpointError<TRoute>` is an opt-in escape hatch

`EndpointError<TRoute>` enforces that the verbose code is one of the route's declared responses but cannot prevent semantic typos within that set (`'OK'` is a valid choice for a route declaring 200 even when the branch should be `'NOT_FOUND'`). Use it only when a controller has a purely-HTTP-shaped decision that doesn't map cleanly from any `DomainError` subclass (e.g. `304 NOT_MODIFIED` from `If-None-Match`). 99% of controllers don't use it — they let the service's `DomainError` bubble.

#### `showToClient` flag controls custom-message exposure in production

Errors carry `showToClient: boolean` (default `false`). In production the client sees the generic message from `statusCodeMap` unless `showToClient: true` is explicitly set; in development the custom message + cause + stack are always shown. The default-false polarity makes safe-by-default explicit — error messages may contain internal references and shouldn't leak unless the author marks them user-facing. Replaces the older double-negative `hideToClient` flag.

#### `safe()` for opt-in error inspection

When a layer genuinely needs to inspect an error before deciding to recover, transform, or rethrow, use the `safe()` helper at `apps/backend/src/utils/safe.ts`. It returns a `Result<T, E>` discriminated union (`{ ok: true, data } | { ok: false, error }`). Always rethrow unknown error classes explicitly in the `!result.ok` branch — forgetting this is the same swallowing-bug try/catch suffers from, just with different syntax. Never wrap routine calls in `safe()`; throw + bubble is the default. See [ADR-0013](../stable/_shared/adr/0013-safe-utility-for-error-inspection.md).

#### Logger singleton everywhere except pre-env boot

The error handler and all in-app logging use the `logger` singleton (from `apps/backend/src/utils/logger.ts`). `console.*` is reserved for code that runs before the env is loaded — i.e. env-validation failures inside `apps/backend/src/utils/env.ts` itself, where the logger cannot yet be configured. The `env.LOG_LEVEL` enum must include every level the logger supports (currently missing `'log'` — bug to fix).

#### Logging discipline · default set + levels

The default log set is intentionally narrow:

- **Request access** at `info` (path + method + status + duration). Currently lives in `logRequestsMiddleware` at debug — bump to info.
- **Errors** at `error`, emitted from the global error handler (per [ADR-0012](../stable/_shared/adr/0012-error-propagation-pattern.md)). Stack trace + cause attached.
- **Drizzle query log** at `debug`, opt-in via env (not enabled by default in prod).
- Service / repository internals **not** logged by default — devs add ad-hoc when debugging, never commit those logs without intent.

Healthcheck / metrics paths should be excluded from request-access logging when they exist (to avoid log spam). Currently no such endpoints; rule lives here for when they do.

#### Logging discipline · structured calls

Every log call uses the shape `logger.<level>(eventName: string, payload?: object)`. No template-string interpolation carrying variable data. Example: `logger.info('task.created', { taskId, userId })` ✓; `logger.info(`Created task ${taskId}`)` ✗. This keeps log records queryable when they're aggregated as JSON. Enforced via convention + code review for now; an eslint rule may be added later if drift becomes visible.

#### Logging discipline · pretty in dev, JSON in prod

Convention: the logger emits pretty/colored output in development (current behavior) and switches to single-line JSON in production. Implementation is deferred until a production log destination is decided — call sites stay the same; the formatter swaps. When prod observability becomes a real concern, swap the custom logger for [`pino`](https://github.com/pinojs/pino) (industry standard for fast structured logging in Node). Pino swap is mechanical because call sites already follow the `(eventName, payload)` convention.

#### Logging discipline · `requestId` on every line via AsyncLocalStorage

Every log line emitted during a request automatically carries a `requestId`, sourced from `AsyncLocalStorage` populated by the first middleware. The id is generated as a UUID (or honored from the `x-request-id` request header if the client sent one) and echoed back in the response. Services / repositories don't need to thread the id through their signatures — the store is accessible from anywhere within the request's async continuation. See [ADR-0015](../stable/_shared/adr/0015-request-id-via-asyncLocalStorage.md).

#### Auth context keys via `AUTH_CTX_KEYS` constants

Strings used as keys on the Hono context for auth data (`'user'`, `'session'`) are accessed via an exported constants module rather than inline literals. The constants are declared with `as const` so TypeScript narrows them to literal types and Hono's `Variables` generic resolves return types correctly (e.g. `c.get(AUTH_CTX_KEYS.user)` returns `User | null`, same as `c.get('user')`). Reasons: typos are caught at the constant access (earlier than at `c.get`); call sites self-document the intent ("auth context read" vs anonymous string); single source of truth if BetterAuth ever changes conventions. Lives at `apps/backend/src/utils/auth-context.ts` (or sibling to `auth.ts`).

For future request-scoped data on the Hono context (tenant, permissions, feature flags, etc.), apply the same pattern — declare an `as const` module per domain, don't preemptively build a generic structure.

#### Zod schema · `.omit()` for feature tables, `.pick()` for junction tables

`createInsertSchema(table).omit({ ... })` is the default — removes server-controlled columns (`id`, `userId`, `createdAt`, `updatedAt`, `deletedAt`) so the schema describes user-provided fields. New columns added to the table flow through to the schema unless opted out — appropriate for evolving feature tables.

`createInsertSchema(table).pick({ ... })` is reserved for **junction / composite-PK tables** where every column is user-provided (e.g. `task_labels` with `taskId` + `labelId`). `.pick()` documents that the listed columns are the complete set — adding a new column to such a table is unusual and should be a deliberate schema update.

Same split applies to `updateXSchema` (omit auto-generated columns + composite PK columns).

#### Service-method naming · three shapes

Service methods take one of three shapes; no others:

1. **Generic CRUD** — `getTasks`, `getTaskById`, `createTask`, `updateTask`, `deleteTask`. Mostly pass-through to the repository; exist on every feature for the uniform `controller → service → repo` flow per [ADR-0008](../stable/_shared/adr/0008-backend-layer-model.md).
2. **Domain verbs** — `completeTask`, `uncompleteTask`, `duplicateTask`, `assignLabelToTask`, `removeLabelFromTask`. Used when the operation has side effects, cross-feature writes, derived data, or a domain-level meaning beyond a field flip. Each maps to a dedicated action endpoint per [ADR-0014](../stable/_shared/adr/0014-endpoint-shape-rules.md).
3. **Granular field-setter wrappers** (`updateTaskStatus`, `updateTaskPriority`, …) — **forbidden**. The unified `updateTask` handles arbitrary partial field updates. Granular wrappers add ceremony without business meaning and trigger the same dedication test as endpoints (per [ADR-0014](../stable/_shared/adr/0014-endpoint-shape-rules.md)).

#### Method-name plurality mirrors return cardinality

`getTasks` returns many; `getTaskById` returns one. `findX` follows the same convention. A method named with plural that returns a single value (or vice versa) is a typo. Holds across all layers — repository, service, controller method names.

#### Route path params are entity-prefixed, never bare `:id`

Every path param identifying a resource is `:<entity>Id` — `:taskId`, `:labelId`, `:projectId`, `:reminderId`. The bare `:id` is never used because nested routes (`DELETE /tasks/:taskId/labels/:labelId`) require entity-prefixed names anyway; mixing bare `:id` at top level with `:<entity>Id` at nested level introduces two patterns and the contributor confusion that comes with it. Zod param schemas mirror the name: `taskIdParamSchema`, `labelIdParamSchema`, etc. Currently `labels.routes.ts` and `reminders.routes.ts` use bare `:id` — pending fix.

#### Drizzle: one `.where(and(...))` per query — never call `.where()` multiple times

Drizzle's `.where()` replaces the WHERE clause, it doesn't append. Calling `.where()` multiple times on the same query silently discards earlier conditions and leaks the surrounding scope (e.g. a query that started with a user-scope `userId` filter and later added a `status` filter ends up returning every user's matching rows). Canonical pattern for dynamic filters: build a conditions array, then call `.where(and(...conditions))` exactly once. For simple known-shape filters, inline `and(cond1, cond2 ? subCond : undefined, …)` is fine — Drizzle's `and()` filters out `undefined` arguments. `$dynamic()` is only for type-flexibility when a query is returned from a helper function; it does not change `.where()`'s replace semantics.

#### Enum-like columns validated at the app boundary, not the DB

Columns whose values are an enum (`tasks.status`, `tasks.priority`, `tasks.recurringInterval`) use plain `text` at the DB level — no `CHECK` constraint, no `pgEnum`. Validation lives at the application boundary via Zod (route schema) + Drizzle's TypeScript types. Rationale + the threshold for reconsidering (external writers gain DB access) in [ADR-0019](../stable/_shared/adr/0019-enum-validation-at-app-boundary-only.md).

#### App feature tables carry `createdAt` + `updatedAt`

Every app-owned feature table has `createdAt` (set on insert, immutable) and `updatedAt` (set on insert, auto-bumped on every UPDATE via Drizzle's `$onUpdate(() => new Date())`). Both are `NOT NULL` with `now()` defaults. Pair with the standard `deletedAt: timestamp NULL` from [ADR-0002](../stable/_shared/adr/0002-soft-delete-via-deletedat.md) for soft-deletable tables. New feature tables get these columns by default — deviations need an ADR. Auth tables (BetterAuth-managed) are exempt. See [ADR-0018](../stable/_shared/adr/0018-createdat-updatedat-on-feature-tables.md).

#### BetterAuth-owned tables are off-limits

The four auth tables — `users`, `sessions`, `accounts`, `verifications` (declared in `apps/backend/src/auth/schema/auth.db.ts`) — are owned by **BetterAuth**, not by this project. Their column shape (including oddities like `verifications.createdAt` / `verifications.updatedAt` being nullable, or auth PKs being `text` instead of `uuid`) is dictated by BetterAuth's library contract. Do NOT migrate these columns to satisfy app-side conventions (e.g. ADR-0016 ID type boundary, ADR-0018 `createdAt`/`updatedAt` uniformity, ADR-0019 enum validation). A schema-cleanup PR that "harmonizes" these tables will break the auth flow at runtime. Only modify them in response to a BetterAuth upgrade or a feature the library itself drives. See [glossary · BetterAuth-owned tables](../stable/_shared/glossary.md#betterauth-owned-tables-off-limits), [ADR-0016](../stable/_shared/adr/0016-id-type-boundary.md), [ADR-0018](../stable/_shared/adr/0018-createdat-updatedat-on-feature-tables.md).

#### Two-mode parent delete

Destructive operations on an entity that owns child entities expose **two delete modes**: (1) **keep children but unlink** (default, safer — DB-level FK action handles the unlink), (2) **cascade soft-delete to the children** at the service layer (explicit user opt-in). Permanent hard-delete from the deleted-items view is a separate third tier; cascade behavior at that tier mirrors the DB's FK action. Applies to projects→tasks ([ADR-0017](../stable/_shared/adr/0017-project-delete-orphans-tasks.md)) and labels→task_labels ([ADR-0007](../stable/_shared/adr/0007-two-mode-label-delete.md)), and to any future parent-child relationship. The opt-in is signalled via a query param on the delete endpoint (e.g. `?cascadeTasks=true`) — never via request body, because DELETE bodies are not standardized.

#### Endpoint shape: unified PATCH · dedicated POST `/action` · dedicated GET `/hydrated`

A resource's HTTP surface follows three rules. Field-level granular PATCH routes (`PATCH /tasks/:id/status`, etc.) are **not** used — the unified `PATCH /:resource/:id` handles arbitrary partial field updates. Dedicated `POST /:resource/:id/<action>` endpoints exist **only** for operations whose semantics include side effects beyond the field flip in the body (cascading state changes, cross-feature writes, derived-data computation, domain verbs). Dedicated `GET /:resource/:id/hydrated` exposes the hydrated read variant (mirroring `findByIdHydrated` per [ADR-0011](../stable/_shared/adr/0011-hydrated-read-interface.md)). The dedication test: if the service-layer method earns its existence (per [ADR-0008](../stable/_shared/adr/0008-backend-layer-model.md)), the URL gets a dedicated path; if not, the unified PATCH covers it. See [ADR-0014](../stable/_shared/adr/0014-endpoint-shape-rules.md).

#### Hydrated-read interface: `findX` + `findXHydrated`

A repository exposes hydrated reads as a pair of methods: `findX` returns the entity bare; `findXHydrated` returns the entity with all its natural relations populated. Middle-ground variants (`findXWithLabelsOnly`) are added only when a real consumer asks for them — not designed up front (YAGNI). Implementation uses Drizzle's relational query API (`db.query.X.findFirst({ with: ... })`); `db.select().leftJoin()` is reserved for the narrower case where the root entity must be filtered by a related entity's column (Drizzle's relational API can't express that). See [ADR-0011](../stable/_shared/adr/0011-hydrated-read-interface.md).

#### Drizzle relations: v1 syntax now, v2 migration tracked

Each `*.db.ts` file declares its `relations()` block in v1 syntax (per-table). When `defineRelations` ships in a stable Drizzle release (currently preview / unreleased in 0.45.2), the project will migrate to v2's centralised `defineRelations(schema, ...)` block — mechanical rename + consolidation, no semantic change. Tracked in [ADR-0011 § Drizzle relations v1 vs v2](../stable/_shared/adr/0011-hydrated-read-interface.md#drizzle-relations-v1-vs-v2).

#### Logger over console *(rule placeholder — to be locked in upcoming grill round)*

#### Pending grills

- Drizzle query style (chained vs object syntax for non-relational queries).
- Route param naming (`:taskId` vs `:id`).
- Service method naming pattern (granular verbs vs domain verbs).
- Composite-PK Zod schema style (`.pick()` vs `.omit()`).
- Auth context keys defined as exported constants (no inline strings).
- `updatedAt` presence across owned tables.
- DB-level CHECK constraints for enums.
- Migration naming.

### Shared (cross-cutting)

*Pending. Anything that applies regardless of backend/frontend.*

- Comment density (default = none unless WHY is non-obvious; documented in CLAUDE.md).
- TODO / FIXME / NOTE conventions.
- Date / time handling (UTC at the boundary, local for display).

## Format for a rule entry

When adding a rule, use this minimal shape:

```md
#### {Short rule name}

{1–3 sentences: the rule itself + the rationale (why this over alternatives). No code snippets — code rots; rules describe behavior + intent. Cross-link the ADR if one exists, or the glossary entry if naming is involved.}
```

That's it. The rule should be readable years from now even when the code it describes has been rewritten.
