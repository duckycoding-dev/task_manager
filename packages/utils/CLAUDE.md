---
created: 2026-05-13
updated: 2026-05-13
summary: Shared, framework-agnostic helpers reusable across frontends. Currently exposes only `cn()`.
---

# packages/utils

Framework-agnostic helpers shared across frontends. Published in-workspace as `@task-manager/utils`.

## Current exports

- `cn()` — clsx + extended tailwind-merge wrapper for composing Tailwind class names safely. Implementation: `src/cn.ts` + `src/tailwind-merge.ts`.

## Build

- Source in `src/`, output in `dist/`. Consumers import from `@task-manager/utils` (resolved via the workspace's package.json `exports`).
- Peer dep: TypeScript `^5`. No runtime framework deps.

## What belongs here

- Anything genuinely framework-agnostic and useful to more than one frontend: class-name helpers, formatters, type utilities, etc.
- App-specific logic, framework-specific hooks/components, or backend-only code do **not** belong here.

## What does NOT belong here

- React, Vue, Angular, or any framework imports — the package must stay portable.
- Hono / backend code — those types come from the backend package's exports.
- Anything that pulls in a heavy runtime dependency just to support one consumer.

## Adding new utilities

When a helper looks shareable, prefer prototyping it inside the consuming app first. Promote it here only once a real second consumer exists or a clear shared contract has emerged. Premature lifting tends to lock in the wrong shape.
