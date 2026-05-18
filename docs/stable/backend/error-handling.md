---
created: 2026-05-13
updated: 2026-05-19
summary: Backend error model — throw + bubble + registry-translate (pattern α). Service and repository layers throw `DomainError` subclasses; the global error handler maps each to an HTTP response via a typed registry (`DOMAIN_ERROR_MAP`). Controllers contain no try/catch. `AppError` / `EndpointError` survive only for inherently-HTTP contexts (middleware, route-validation `defaultHook`).
---

# Backend error handling

The error model is locked in three ADRs. This page is a reader-friendly index over those decisions — it does not duplicate them.

- **Pattern α (throw + bubble + registry-translate)** — [ADR-0012](../_shared/adr/0012-error-propagation-pattern.md). Authoritative on `DomainError` hierarchy, `DOMAIN_ERROR_MAP`, `showToClient`, and the rationale for picking α over alternatives.
- **Repository validates on exit** — [ADR-0010](../_shared/adr/0010-repository-validates-on-exit.md). Why every repo zod-parses its return data and what happens when a row fails.
- **`safe()` utility for opt-in error inspection** — [ADR-0013](../_shared/adr/0013-safe-utility-for-error-inspection.md). The rare recovery-site escape hatch.

## Quick mental model

A service or repository method that fails throws a [`DomainError`](../_shared/glossary.md#domainerror) subclass (`EntityNotFoundError`, `BusinessRuleViolationError`, `RepositoryValidationError`, etc.). Nothing in between (controller, middleware, business code) catches it. The single global `errorHandler` registered via `app.onError(errorHandler)` looks the subclass up in `DOMAIN_ERROR_MAP` and produces an HTTP response with the mapped status + verbose code. `AppError` and `EndpointError` continue to exist but only for places that are genuinely HTTP-context (auth middleware, the `@hono/zod-openapi` `defaultHook` for route-schema validation failures).

This is the **opposite** of the controller-wraps-every-call-in-try/catch pattern (pattern β) that earlier revisions of this doc described. β is superseded; see ADR-0012 § "Why α over the alternatives".

## What each layer throws

- **Repository** — `RepositoryValidationError` when a row fails its exit zod parse. Any other DB error is left to bubble untouched (Postgres / drizzle errors reach the handler as unknowns → 500). See [ADR-0008](../_shared/adr/0008-backend-layer-model.md) for the layer model and [ADR-0010](../_shared/adr/0010-repository-validates-on-exit.md) for the parse-on-exit contract.
- **Service** — any `DomainError` subclass that names the business condition (`EntityNotFoundError`, `BusinessRuleViolationError`, `ConflictError`, `ForbiddenError`, `AuthenticationError`, `ValidationError`). Services must **not** throw `AppError`; doing so couples business code to HTTP and breaks reusability from non-HTTP entry points.
- **Controller** — generally throws nothing; surfaces the service's value to Hono. The narrow exception is [`EndpointError<TRoute>`](../_shared/glossary.md#endpointerror) used as an opt-in escape hatch for purely-HTTP outcomes that don't map from any domain class (e.g. `304 NOT_MODIFIED` from an `If-None-Match` check). 99% of controllers don't reach for it.
- **Middleware / route-validation hooks** — `AppError` (or in the validation case, the `@hono/zod-openapi` `defaultHook` re-throws `AppError('BAD_REQUEST', ...)`). These contexts are inherently HTTP, so they use the HTTP-flavoured error class directly.

## Where to look in code

- `apps/backend/src/utils/errors/domain-errors.ts` — `DomainError` abstract base, the seven subclasses, and `DOMAIN_ERROR_MAP`.
- `apps/backend/src/utils/errors/http-errors.ts` — `AppError`, `EndpointError`, and the `errorHandler` that performs the dispatch.
- `apps/backend/src/utils/safe.ts` — the `safe()` utility + `Result<T, E>` type.
- `apps/backend/src/utils/status-codes.ts` — `VerboseStatusCode` enum + `statusCodeMap` (status + generic message per code).

## `showToClient` (response message exposure)

Both `DomainError` and `AppError` carry a `showToClient: boolean` flag (default `false`). In dev, the handler always echoes the custom message. In prod, `showToClient: true` is the explicit opt-in to expose the custom message; otherwise the client sees the generic message from `statusCodeMap` for the verbose code. The default `false` exists because error messages may contain identifiers, internal references, or stack hints — authors opt in only when the message is intentionally user-facing. See [ADR-0012 § showToClient](../_shared/adr/0012-error-propagation-pattern.md#showtoclient-flag-renamed-from-hidetoclient).

## Adding a new domain error

Two steps, in order:

1. Add a `DomainError` subclass in `domain-errors.ts`. Constructor takes whatever fields belong to the error condition (e.g. `(entity, id)` for `EntityNotFoundError`). Pass the chosen default message + the standard `DomainErrorOptions` (`{ message?, showToClient?, cause? }`) to `super()`.
2. Add the registry entry in `DOMAIN_ERROR_MAP` pointing to the right HTTP status + verbose code. **Forgetting this step** falls the handler through to a generic 500.

Both files live in `apps/backend/src/utils/errors/`. A future cross-feature error (e.g. `RateLimitError`) follows the same shape — no other changes needed elsewhere.

## When to use `safe()`

Default is throw + bubble. Reach for `safe()` only when the calling code has a concrete plan to inspect a known error class and recover, transform, or retry. Always rethrow unknowns explicitly inside the `!result.ok` branch — forgetting the rethrow swallows unrelated errors. See [ADR-0013](../_shared/adr/0013-safe-utility-for-error-inspection.md) for the rules.

## Repository validation specifics

A repository row that fails its zod parse becomes a `RepositoryValidationError` carrying the **failing input** (`input`), the structured **issue array** (`issues`), the **prettified message** (`options.message` via `formatZodError(...)`), and the **full ZodError** in the `cause` chain. The error maps to HTTP 500 with `showToClient: false` — clients see the generic `Internal Server Error`; dev logs and the cause chain carry the full diagnostic context for debugging. See [ADR-0010](../_shared/adr/0010-repository-validates-on-exit.md).

## Related

- [ADR-0008 (backend layer model)](../_shared/adr/0008-backend-layer-model.md)
- [ADR-0014 (endpoint shape rules)](../_shared/adr/0014-endpoint-shape-rules.md) — explains why controllers stay HTTP-thin.
- [ADR-0015 (`requestId` via AsyncLocalStorage)](../_shared/adr/0015-request-id-via-asyncLocalStorage.md) — every log line emitted from the handler is tagged with the request's id.
- Glossary entries: [DomainError](../_shared/glossary.md#domainerror) · [AppError](../_shared/glossary.md#apperror) · [EndpointError](../_shared/glossary.md#endpointerror) · [`showToClient`](../_shared/glossary.md#showtoclient) · [Error registry · `DOMAIN_ERROR_MAP`](../_shared/glossary.md#error-registry--domain_error_map) · [`safe()` utility](../_shared/glossary.md#safe-utility--resultt-e).
