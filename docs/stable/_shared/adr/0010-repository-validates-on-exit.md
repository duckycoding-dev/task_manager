---
created: 2026-05-16
updated: 2026-05-16
summary: Repository methods Zod-validate their results before returning to the service layer. Validation failures throw `RepositoryValidationError`, caught by the global error handler.
status: accepted
---

# Repository validates data on exit

Repository methods Zod-validate the rows they return **at the module boundary** — i.e. before handing data to the service layer. Failures throw `RepositoryValidationError` with the offending input + Zod issues; the global error handler maps it to a 500 (with full cause logged in dev). Internal-to-repo reads (subquery composition) don't need to revalidate. This catches schema drift early (migrations not synced with code, manual SQL, multi-process DB writes) and makes the DB-to-domain conversion an explicit, runtime-checked step rather than a silent type cast.

Alternatives considered: trusting Drizzle's typed rows alone (rejected for this codebase — validation cost is negligible at this scale, learning project benefits from loud failures, schemas are shared with the frontend so drift detection matters), and validating in the service layer instead (rejected — repo is the closest boundary to the DB; validation belongs there).

See coding-practices under [Backend · Repository](../../../llm/coding-practices.md#backend-hono--drizzle--zod).
