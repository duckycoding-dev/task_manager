---
created: 2026-05-16
updated: 2026-05-16
summary: Backend uses a 4-layer model — controller (HTTP boundary), service (business logic + orchestration), repository (DB access), and integration client (3rd-party APIs). Each has a single responsibility and a defined contract.
status: accepted
---

# Backend layer model · controller / service / repository / integration-client

The backend uses **four layers** with clear roles: **controller** owns the HTTP boundary (consume validated input from route schemas, call exactly one service method, format the response); **service** owns business logic, fine-grained authorization, transactions, and orchestration across repos and clients; **repository** owns access to a single DB table (with limited cross-table JOINs for hydrated read shapes); **integration client** owns access to a single third-party service (typed wrapper around an SDK or fetch). Services depend on repositories and integration clients as peers — both are "data sources" external to the service. This separates HTTP concerns from domain logic from data-access concerns, makes each layer independently testable, and keeps third-party API churn contained inside its client.

Alternatives considered: dropping the service layer when methods are trivially pass-through (rejected — uniform flow within a feature is more valuable than the ceremony cost) and merging integration clients into the repository concept (rejected — repos own SQL semantics, clients own HTTP semantics; mixing them blurs error handling, retry, and validation responsibilities).

See coding-practices under [Backend](../../../llm/coding-practices.md#backend-hono--drizzle--zod) for the per-layer rules and the cross-layer call contract.
