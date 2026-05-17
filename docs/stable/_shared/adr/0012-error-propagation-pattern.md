---
created: 2026-05-17
updated: 2026-05-17
summary: Errors are thrown at their origin and bubble to a single global handler. Service + repository layers throw `DomainError` subclasses; the handler maps them to HTTP responses via a typed registry. Controllers contain no try/catch. `EndpointError<TRoute>` retained only as an opt-in escape hatch for purely-HTTP-shaped errors.
status: accepted
---

# Error propagation pattern: throw + bubble + registry-translate

Errors propagate from where they originate to the **single global error handler** without intermediate try/catch. Service and repository layers throw subclasses of a new `DomainError` base; the handler maps each subclass to an HTTP status + verbose code via a typed registry (`DOMAIN_ERROR_MAP`). Controllers do not catch — they're HTTP-thin per [ADR-0008](./0008-backend-layer-model.md). The previously-documented "controller wraps every service call in try/catch and translates to HTTP" pattern is **superseded** — it was never followed in code, multiplies translation logic across every endpoint, and is structurally unable to prevent the semantic-typo problem (e.g. throwing `'OK'` when meaning `'NOT_FOUND'` in a route that declares both).

## DomainError hierarchy

`DomainError` is the abstract base for non-HTTP errors. Subclasses encode business meaning, not HTTP codes:

- `EntityNotFoundError(entity, id)` — 404
- `ValidationError(issues, input?)` — 400
- `BusinessRuleViolationError(rule, ctx?)` — 422
- `ConflictError(detail)` — 409
- `ForbiddenError(reason?)` — 403
- `AuthenticationError(reason?)` — 401
- `RepositoryValidationError(input, issues)` — 500 (data corruption, not client fault); originated in [ADR-0010](./0010-repository-validates-on-exit.md), now reachable

Every new subclass MUST be registered in `DOMAIN_ERROR_MAP` (`apps/backend/src/utils/errors/`). The registry is a `Record<string, { status: number; verboseCode: VerboseStatusCode }>` typed via `satisfies` for exhaustive shape but consumers rely on convention to keep it in sync. Forgetting an entry → handler falls through to 500.

## AppError vs EndpointError — when each survives

- **`AppError<TCode>`** — HTTP-flavored. Reserved for cases that are inherently HTTP-context: middleware (auth, rate limit, CORS), the `@hono/zod-openapi` `defaultHook` for route-schema validation failures. Services and repositories MUST NOT throw `AppError` — they throw `DomainError` subclasses.
- **`EndpointError<TRoute>`** — typed-by-route. Retained as **opt-in escape hatch** for the rare case a controller has a purely-HTTP decision (e.g. `304 NOT_MODIFIED` from `If-None-Match` check) that doesn't map cleanly from any domain class. 99% of controllers don't use it. Its type-safety bites only against "code is one of the declared route responses" — it cannot catch semantic typos within that set, so it's NOT a default-use tool.

## `showToClient` flag (renamed from `hideToClient`)

Errors carry a `showToClient: boolean` flag, defaulting to `false`. Behavior:

- **dev**: always show custom message + cause + stack regardless of `showToClient`.
- **prod**: 
  - `showToClient === true` → custom message reaches the client.
  - `showToClient === false` (default) → client sees the generic message from `statusCodeMap` for the verbose code. Custom message + cause + stack are logged but not exposed.

Default false enforces safe-by-default: error messages may contain identifiers, stack traces, or internal references. Authors opt in explicitly when the message is user-facing (`new BusinessRuleViolationError('TASK_LIMIT_REACHED', { message: 'You cannot have more than 1000 open tasks.', showToClient: true })`).

The old `hideToClient` was a double-negative with default `true`; rename to `showToClient` with flipped default removes the mental flip.

## Handler responsibilities

The global error handler:

1. Determine which class the error belongs to (`DomainError` → registry, `AppError` → its own status/code, `EndpointError` → its own, else → 500).
2. Choose the response message based on `showToClient` + `NODE_ENV`.
3. Log via the `logger` singleton (NOT `console.error`). Pre-env failures inside `env.ts` are the only place `console.*` survives — it has to, because the logger depends on env.
4. Format the response per the existing `ErrorResponseSchema` (`{ success: false, error, verboseCode, cause?, stack? }`). `cause` + `stack` only included in dev.

## Why α (this pattern) over the alternatives

- **β (controller try/catch + translate)** — multiplies the same translation across every controller; allows the `'OK'` semantic typo per route (route declares 200, you accidentally throw it from a not-found branch); scales linearly with endpoint count.
- **γ (service throws `AppError` directly)** — couples service layer to HTTP; hard to reuse from non-HTTP entry points (CLI, scheduled jobs).
- **α** — single sink for translation; service stays HTTP-agnostic; new error type = one class + one registry line; the `'OK'`-typo is structurally impossible because the code is determined by the class, not a string argument.

## Documented in

- Coding-practices: [Backend · Error handling](../../../llm/coding-practices.md#backend-hono--drizzle--zod) (no try/catch default · `safe()` for recovery · logger singleton · `showToClient` semantics).
- Glossary: `DomainError`, `AppError`, `EndpointError`, `showToClient`, `error registry`.
- Pending follow-up: `docs/stable/backend/error-handling.md` to be refreshed to match this ADR (currently still documents pattern β).

See also: [ADR-0008 (layer model)](./0008-backend-layer-model.md), [ADR-0010 (repository validates on exit)](./0010-repository-validates-on-exit.md), [ADR-0013 (`safe()` opt-in error inspection)](./0013-safe-utility-for-error-inspection.md).
