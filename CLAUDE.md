---
created: 2026-05-13
updated: 2026-05-13
summary: Entry point for LLM agents working on the task_manager monorepo. Project orientation + links to per-workspace CLAUDE.md, behavior rules, and stable docs.
---

# task_manager

Practice monorepo: one shared **backend** in `apps/backend/`, swappable **frontends** in `apps/<frontend>/` (currently `react19`) all talking to the same backend via Hono RPC. Goal is exploring frontend stacks against a stable backend — the backend is the constant, frontends are the variables.

## Layout

- `apps/backend/` — Hono REST API + Drizzle (PostgreSQL) + BetterAuth + Zod OpenAPI. The shared backend.
- `apps/react19/` — first frontend: React 19 + TanStack Router/Query + Tailwind 4 + daisyUI + better-auth client.
- `packages/utils/` — framework-agnostic shared helpers (`cn()`).
- `scripts/run-project-with-specific-frontend.ts` — launcher used by root scripts to start backend + a chosen frontend together.

## Tooling

- Bun workspaces (`apps/*`, `packages/*`). Bun is the package manager.
- Per-app runtime is not forced — frontends can run on whatever (Vite/Node), backend currently uses Bun.
- TypeScript everywhere. Strict mode on, composite project setup at the root.
- Root script of note: `bun run react19:dev` (boots backend + react19 together via `scripts/run-project-with-specific-frontend.ts`).

## Per-workspace CLAUDE.md

Each workspace has its own scoped CLAUDE.md. Open the one that matches the area you're editing:

- [apps/backend/CLAUDE.md](./apps/backend/CLAUDE.md)
- [apps/react19/CLAUDE.md](./apps/react19/CLAUDE.md)
- [packages/utils/CLAUDE.md](./packages/utils/CLAUDE.md)

## Agent behavior

All generic behavior rules (communication style, mermaid-only diagrams, no git without permission, ask follow-ups, challenge assumptions, frontmatter, etc.) live in one editable file:

→ **[docs/llm/behavior.md](./docs/llm/behavior.md)** — read this before doing anything substantive.

## Plans, handoffs, stable docs

Convention summary (full rules in [docs/llm/behavior.md](./docs/llm/behavior.md)):

- **Plans** → `docs/plans/<feature>/<slug>.md` (or `_shared/` for cross-cutting). Include a `- [ ] / - [x]` checklist. **Delete** the plan file when complete.
- **Handoffs** → `docs/handoffs/<feature>/<slug>.md`. Write one whenever work stops with anything incomplete. Deleted alongside the plan once complete.
- **Stable** → `docs/stable/<feature>/<slug>.md`. Durable knowledge. Replaces a completed plan.
- **`<feature>`** = backend feature names where applicable (`tasks`, `projects`, `labels`, `reminders`, `auth`), or `backend`, `react19`, `_shared`. New buckets allowed for new apps/domains.
- **App-internal docs** → `apps/<app>/docs/` (flat) for tool guides only that app cares about. Promote to `docs/stable/_shared/<tool>.md` when a 2nd consumer adopts the tool.
- **Frontmatter** → every `.md` (under `docs/`, in `apps/*/docs/`, and every `CLAUDE.md`) carries `created`, `updated`, `summary`. Bump `updated` on every meaningful edit.

## Existing stable docs (some unverified)

The codebase is ~1 year old; some prior docs are kept as-is but may drift from current code. Verify against the actual codebase before relying on details:

- [docs/stable/_shared/repo.md](./docs/stable/_shared/repo.md) — monorepo overview.
- [docs/stable/backend/architecture.md](./docs/stable/backend/architecture.md) — controller/service/repository layout.
- [docs/stable/backend/error-handling.md](./docs/stable/backend/error-handling.md) — AppError / EndpointError / domain errors.
- [docs/stable/backend/responses.md](./docs/stable/backend/responses.md) — response-shape edge cases.
- [docs/stable/backend/zod-schemas.md](./docs/stable/backend/zod-schemas.md) — ⚠ flagged outdated; user has newer practices from other projects.
