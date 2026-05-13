---
created: 2026-05-13
updated: 2026-05-13
summary: react19 frontend workspace guide — React 19 + TanStack Router/Query + Tailwind 4 + daisyUI + better-auth client, consuming the shared Hono backend via RPC.
---

# apps/react19

First frontend in the monorepo. Vehicle for exploring React 19 + the TanStack ecosystem + daisyUI for styling. Consumes the shared backend (`@task-manager/backend`) via Hono RPC.

## Stack

- React 19, Vite 7.
- TanStack Router (file-based routing; route tree generated into `src/routeTree.gen.ts` by the vite plugin).
- TanStack Query.
- Tailwind CSS 4 + daisyUI — configured directly in `src/styles/style.css` via `@import "tailwindcss";` and `@plugin "daisyui";`. **No `tailwind.config.js`** — Tailwind 4 doesn't need one when used as a node dep.
- `better-auth/react` client for sessions.
- `@task-manager/utils` for `cn()` (clsx + extended tailwind-merge).

## Backend wiring

- `src/lib/backend.ts` — Hono RPC client (`hcWithType` from `@task-manager/backend/hc`). Base URL from `VITE_BACKEND_PORT`. Custom fetch sets `credentials: 'include'` so the BetterAuth cookie flows.
- `src/lib/auth-client.ts` — `createAuthClient()` with `baseURL` from `VITE_BACKEND_PORT` and `basePath: '/auth'`. Exports `useAuthSession`.

## Folder layout

- `src/routes/` — TanStack Router file-based routes. Files map to URL paths; `__root.tsx` is the app shell + error boundary.
- `src/features/` — domain-scoped components grouped by area (`tasks/`, `users/auth/`, `navigation/`, `ui/`).
- `src/lib/` — backend + auth clients, anything that bootstraps an external service.
- `src/layouts/` — shared page layouts (e.g. `HolyGrailLayout`).
- `src/styles/` — global CSS imports; daisyUI plugin is configured here.

## Path alias

`@/* → ./src/*` (in `tsconfig.app.json`).

## DaisyUI guidance

Class-name catalog + install/usage rules live in [`apps/react19/docs/daisyui.md`](./docs/daisyui.md). When a second frontend adopts daisyUI, **promote** that doc to `docs/stable/_shared/daisyui.md` and update links.

DaisyUI also has its own MCP server (configured in the repo's `.mcp.json`) — agents can pull live class lookups from it when daisyui questions come up.

## Notes & gotchas

- TanStack Query `useMutation` triggers two rerenders unconditionally — see [`docs/stable/react19/notes/use-mutation-rerenders.md`](../../docs/stable/react19/notes/use-mutation-rerenders.md).

## Multi-frontend context

This is one of N planned frontends sharing the same backend. **Don't bake react-specific assumptions into shared code** — anything reusable across frontends belongs in `packages/utils/` (framework-agnostic only) or in a new shared package. Hono types come from the backend; consume them, don't fork them.
