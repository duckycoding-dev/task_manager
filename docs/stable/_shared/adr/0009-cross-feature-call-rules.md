---
created: 2026-05-16
updated: 2026-05-16
summary: Cross-feature reads call the other feature's repository directly; cross-feature writes / operations with rules call the other feature's service. Feature dependencies form a DAG; cycles are a refactoring signal.
status: accepted
---

# Cross-feature call rules

When code in feature **X** needs to interact with feature **Y**, the call target depends on intent: **reads of just data** call **`Y`'s repository directly** (no detour through `Y`'s service); **writes or operations with business rules / side effects** call **`Y`'s service** so the rules are enforced uniformly. Within a feature, the controller → service → repository chain is uniform even for pass-through methods (per [ADR-0008](./0008-backend-layer-model.md)). Feature dependencies form a directed acyclic graph — a cycle means the boundaries are wrong and the features need refactoring or a shared module extracted.

Rationale: routing every cross-feature read through the other service forces pass-through methods to exist only as bridges, adding ceremony without benefit. Conversely, calling another feature's repository for writes silently bypasses business rules added later to that feature's service — a real bug source. Splitting by intent keeps reads cheap and writes safe.

See coding-practices under [Backend · Cross-feature calls](../../../llm/coding-practices.md#backend-hono--drizzle--zod).
