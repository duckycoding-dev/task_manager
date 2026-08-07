# Task Manager

Task Manager is an incremental frontend laboratory built around reusable TypeScript backend business logic.

The backend is complete, while the frontend implementations are developed progressively. The goal is to explore different React patterns, UI systems and tooling without redesigning the same backend domain for every experiment. This repository should be read as a laboratory, not as a finished product.

## Project status

| Area | Status | Main technologies |
|---|---|---|
| Backend | Complete | Hono, TypeScript, Drizzle ORM, PostgreSQL, Zod/OpenAPI |
| React 19 frontend | In progress | React 19, TanStack Query, TanStack Router, Tailwind CSS, daisyUI |
| Additional frontends | Planned or incremental | Reuse the same backend business logic |

## Goals

- Keep backend business logic reusable across frontend implementations
- Compare frontend patterns and libraries on the same domain
- Experiment with UI systems and development tooling incrementally
- Preserve type-safe boundaries between client, API and database layers

## Requirements

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) for the local PostgreSQL database

## Local development

Install the workspace dependencies:

```sh
bun install
```

Start the PostgreSQL development database from `apps/backend`:

```sh
cd apps/backend
bun run db:dev
```

In another terminal, start the backend and the React 19 frontend from the repository root:

```sh
bun run react19:dev
```

The development runner uses port `3001` for the backend and `3002` for the frontend by default. Both ports can be overridden through the runner arguments documented in `scripts/run-project-with-specific-frontend.ts`.

## Workspace overview

| Path | Responsibility |
|---|---|
| `apps/backend` | API, domain features, persistence and OpenAPI integration |
| `apps/react19` | Current React 19 frontend experiment |
| `packages/utils` | Utilities shared across workspace packages |
| `scripts` | Development orchestration scripts |

## Quality checks

```sh
bun run lint
bun run format:check
```

The root test script is currently a placeholder and exits with an error. Do not present the repository as having an automated test suite until real tests and a passing command are added.

## License

[MIT](LICENSE)
