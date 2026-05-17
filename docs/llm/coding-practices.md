---
created: 2026-05-14
updated: 2026-05-18
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
