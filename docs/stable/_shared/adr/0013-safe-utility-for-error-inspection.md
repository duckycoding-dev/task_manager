---
created: 2026-05-17
updated: 2026-05-17
summary: Add a `safe()` utility (at `apps/backend/src/utils/safe.ts`) that wraps a promise and returns a `Result<T, E>` discriminated union, used opt-in at the rare sites where a caller wants to inspect an error to recover/transform/retry. Throw + bubble remains the default everywhere else.
status: accepted
---

# `safe()` utility for opt-in error inspection

The default error pattern per [ADR-0012](./0012-error-propagation-pattern.md) is throw + bubble — controllers and most service methods never inspect errors. For the small minority of cases where a layer genuinely wants to handle an error (e.g. "get or create a default", "treat ConflictError on assignment as success", "fall back to defaults on RepositoryValidationError"), the codebase exposes a `safe()` helper in `apps/backend/src/utils/safe.ts`. It wraps a promise and returns a discriminated union:

```ts
type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };
async function safe<T>(fn: () => Promise<T>): Promise<Result<T>>;
```

Usage at a recovery site:

```ts
const result = await safe(() => taskRepo.findById(id, uid));
if (!result.ok) {
  if (result.error instanceof EntityNotFoundError) {
    return createDefaultTask(...);
  }
  throw result.error;   // rethrow unknowns explicitly
}
const task = result.data;
```

Rejected: tuple flavor (`[err, data]`) — Go-style. User preference is the discriminated union object form (`{ ok, data | error }`) — more TypeScript-idiomatic, narrows naturally with `if (!result.ok)`.

Rejected: full `Result` library (`neverthrow`, `ts-results-es`, `effect-ts`) — paradigm shift requiring every function to return `Result`. Massive boilerplate at every call site; overkill for a codebase where 99% of errors uniformly bubble to the handler.

Rejected: typed errors in the return signature (`Promise<Result<T, EntityNotFoundError | RepositoryValidationError>>`) — TS has no `throws` clause and tracking explicit error types per function requires author discipline that scales poorly. `safe()` returns `Result<T, Error>`; callers use `instanceof` to narrow, same as in a try/catch.

## Use only at recovery sites

`safe()` is an opt-in tool. Rules:

- **Default**: throw + let it bubble. No `safe()`.
- **Use `safe()`** only when the caller has a concrete plan to inspect and act on a known error class (recover / transform / fall back). Don't sprinkle for "defensive" reasons.
- **Always rethrow unknowns** explicitly inside the `!result.ok` branch. Forgetting the rethrow swallows unrelated errors — this is the classic try/catch footgun, just with different syntax.

A `safe()` call that doesn't end with a rethrow of unknown errors is a bug.

## Why not just use try/catch

`safe()` doesn't replace try/catch's expressive power — both can do everything the other can. The win is **syntax + flatness**: error and value are siblings (`result.ok` / `result.data` / `result.error`), no nested block, easier to read inline. The footgun ("forgot to rethrow unknowns") survives. The benefit is purely ergonomic at the rare site that needs it.

## Lives at

`apps/backend/src/utils/safe.ts`. Plain TS, no dependencies. ~10 lines. The `Result<T, E>` type alias is exported alongside so consumers can use it for their own utilities.

See also: [ADR-0012 (error propagation pattern)](./0012-error-propagation-pattern.md).
