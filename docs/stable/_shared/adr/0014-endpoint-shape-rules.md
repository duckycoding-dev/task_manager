---
created: 2026-05-18
updated: 2026-05-18
summary: Endpoint shape pattern γ — unified PATCH `/:resource/:id` for partial field flips; dedicated POST `/:resource/:id/<action>` for business operations whose semantics include side effects beyond the body's fields; dedicated GET `/:resource/:id/hydrated` for the natural hydrated read.
status: accepted
---

# Endpoint shape rules: unified PATCH + dedicated action + dedicated hydrated

A resource's HTTP surface is shaped by **intent**, not by field. Field-level granular endpoints (`PATCH /tasks/:id/status`, `/priority`, `/recurring-interval`) are removed because they mirror a unified `PATCH /:resource/:id` with no added meaning. The unified PATCH handles arbitrary partial updates (title, description, dueDate, projectId, priority, recurringInterval, status, etc.). Dedicated `POST /:resource/:id/<action>` endpoints exist only for operations whose semantics extend **beyond a field flip** — cascading state changes, cross-feature writes, derived-data computation, or domain verbs that mean more than "set X = Y". The hydrated read variant lives at `GET /:resource/:id/hydrated`, mirroring [ADR-0011](./0011-hydrated-read-interface.md)'s `findByIdHydrated` method.

**Rule** (the one to remember):

> An endpoint earns dedication when its semantics include side effects beyond the field flip in its body. Pure single-field flips with no side effects use the unified PATCH.

This mirrors [ADR-0008](./0008-backend-layer-model.md)'s service-layer rule ("a service method may only exist if it does at least one of: business-rule check / multi-repo orchestration / policy enforcement / derived-data computation / cross-feature side-effect"). The endpoint surface reflects the service-method surface 1:1: if the service has a meaningful method, the endpoint exposes it under a dedicated path; if the service's "method" is just a pass-through to a repository PATCH, the endpoint is the unified PATCH and no dedicated route exists.

## Note on ADR-0008's pass-through rule

ADR-0008 does NOT forbid pass-through *service methods* — it preserves them for the uniform `controller → service → repo` flow within a feature. The endpoint-level rule here is a separate concern: pass-through *endpoints* (granular routes that ONLY mirror a single-field setter with no added value) are wasteful API surface and get dropped. Pass-through service methods stay; pass-through endpoints don't.

## Concrete tasks-feature endpoint set under γ

```
GET     /tasks                                  list (filters per ADR-0006)
POST    /tasks                                  create
GET     /tasks/:taskId                          get bare (ADR-0011)
GET     /tasks/:taskId/hydrated                 get with labels + reminders (ADR-0011)
PATCH   /tasks/:taskId                          partial field update — title, description, dueDate, projectId, priority, recurringInterval, status*
DELETE  /tasks/:taskId                          soft-delete (ADR-0002)

POST    /tasks/:taskId/complete                 business action — status→done + recurring spawn + reminder cleanup
POST    /tasks/:taskId/uncomplete               business action — status→todo + revert
POST    /tasks/:taskId/duplicate                business action — clone task + labels

POST    /tasks/:taskId/labels                   assign label (M2M)
DELETE  /tasks/:taskId/labels/:labelId          unassign label
```

`*` PATCH can flip status for non-done transitions (e.g. kanban drag from `todo` to `in_progress`). Drag-to-done fires `POST /complete` because of the side effects (recurring spawn + reminder cleanup); the URL signals the business meaning.

Removed: `PATCH /tasks/:taskId/status`, `PATCH /tasks/:taskId/priority`, `PATCH /tasks/:taskId/recurring-interval`, `PATCH /tasks/:taskId/is-recurring` (last one already moot per [ADR-0003](./0003-drop-tasks-isrecurring.md)).

## Hydrated read URL shape — dedicated path, not query param

Two candidates were considered:

- **A · `GET /:resource/:id/hydrated`** — dedicated path. Chosen.
- **B · `GET /:resource/:id?include=labels,reminders`** — query-param based include list. Rejected.

A wins on: symmetry with [ADR-0011](./0011-hydrated-read-interface.md)'s repo method names (`findById` ↔ `:id`, `findByIdHydrated` ↔ `:id/hydrated`); cleaner OpenAPI typing (each route has one response schema, no conditional types); cleaner Hono RPC client (typed methods per path); easier per-route caching + observability.

B would offer middle-ground reads ("labels but not reminders") for free, but [ADR-0011](./0011-hydrated-read-interface.md) already concluded middle-ground reads are YAGNI for v1. The benefit B offers is unused.

When middle-ground variants do appear with frequency (real consumer, not theoretical), add a specific dedicated path per variant — same growth pattern as the rest of the API.

## Action endpoint shape

Every dedicated action endpoint:

- Method: `POST` (action verbs are not idempotent in the GET/PUT/DELETE sense; POST is the right HTTP fit).
- Path: `/:resource/:id/<verb>` where `<verb>` is the kebab-case form of the domain operation (`complete`, `uncomplete`, `duplicate`, `restore`, etc.).
- Body: minimal — only inputs the action needs that aren't derivable from the URL. Most actions take an empty body.
- Response: the resource in its post-action state, hydrated when relevant. The shape matches the corresponding `GET` variant (bare or hydrated) so consumers don't need separate response schemas.
- Status code: `200` for successful state change. `202` if the action is async (none today).

The action endpoint's controller is HTTP-thin per [ADR-0008](./0008-backend-layer-model.md): parse input, call one service method (e.g. `tasksService.completeTask(id, userId)`), format the response. The side effects live in the service.

## Open questions deferred to implementation time

These don't affect the endpoint shape itself; they affect service internals:

- **Recurring-task spawn semantics for `POST /complete`** — does completing a recurring task (a) spawn the next occurrence as a new row, (b) keep the same row and bump `dueDate`, or (c) other? Schema-affecting decision. Tracked separately.
- **`POST /uncomplete` exact semantics** — does uncompleting a recurring task that already spawned its next occurrence rollback that spawn? Edge case to decide.

Locked: the endpoint exists at `POST /tasks/:id/complete` regardless of which semantic wins; the body and response shape don't change.

## Documented in

- Coding-practices: [Backend · Endpoint shape rule](../../../llm/coding-practices.md#backend-hono--drizzle--zod).
- Glossary: `Action endpoint`.

See also: [ADR-0008 (layer model)](./0008-backend-layer-model.md), [ADR-0011 (hydrated-read interface)](./0011-hydrated-read-interface.md), [ADR-0012 (error propagation pattern)](./0012-error-propagation-pattern.md).
