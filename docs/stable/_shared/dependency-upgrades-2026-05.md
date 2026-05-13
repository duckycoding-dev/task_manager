---
created: 2026-05-13
updated: 2026-05-13
summary: Phase 1 dependency upgrade — backend + root deps brought to latest stable, in 9 grouped commits. Records before/after versions, API shifts, deferrals, and follow-ups.
---

# Dependency upgrades — 2026-05

Phase 1 of the post-init roadmap. Goal: bring `apps/backend` + root dependencies to latest stable. `apps/react19` and `packages/utils` were out of scope.

Approach: per-group commits (~9 boundaries), verify gate `tsc + boot + curl` between each group, no automatic commits — user reviewed and committed each group.

## Final versions

### Root (`/package.json`)

| Package | Before | After | Notes |
|---|---|---|---|
| husky | 9.1.7 | 9.1.7 | already latest |
| lint-staged | 16.2.3 | 17.0.4 | major bump, no API changes affecting our config |
| prettier | 3.6.2 | 3.8.3 | |
| eslint-config-prettier | 10.1.8 | 10.1.8 | already latest |
| @types/eslint-config-prettier | 6.11.3 | 6.11.3 | already latest |
| eslint | 9.36.0 | 10.3.0 | landed after bumping react19 plugins (see follow-up below) |
| @eslint/js | 9.36.0 | 10.0.1 | |
| typescript-eslint | 8.45.0 | 8.59.3 | |
| globals | ^16.4.0 | ^17.6.0 | |
| better-auth | 1.3.24 | 1.6.11 | |
| clsx | 2.1.1 | 2.1.1 | already latest |
| cva | 1.0.0-beta.4 | **removed** | unused (grep confirmed only the root package.json declaration referenced it) |
| tailwind-merge | 3.3.1 | 3.6.0 | |
| typescript | 5.9.3 | 6.0.3 | major bump — see backend tsconfig note |
| @types/bun | latest | 1.3.14 | pinned exact instead of "latest" |

### Backend (`/apps/backend/package.json`)

| Package | Before | After | Notes |
|---|---|---|---|
| hono | 4.11.1 | 4.12.18 | |
| @hono/zod-validator | 0.7.5 | 0.8.0 | |
| @hono/zod-openapi | 1.1.5 | 1.4.0 | **fixed** the duplicate-zod type errors (161 → 0 tsc errors) |
| @scalar/hono-api-reference | 0.9.28 | 0.10.14 | |
| drizzle-orm | 0.45.1 | 0.45.2 | |
| drizzle-zod | 0.8.3 | 0.8.3 | already latest |
| drizzle-kit | 0.31.8 | 0.31.10 | |
| postgres | 3.4.7 | 3.4.9 | |
| zod | 4.2.1 | 4.4.3 | |
| typescript | 5.9.3 | 6.0.3 | |
| @types/bun | 1.3.4 | 1.3.14 | |

## API shifts encountered

1. **`@hono/zod-openapi` 1.1.5 → 1.4.0** — Resolved the long-standing duplicate-zod issue where userland `zod` and the version bundled under `@asteasolutions/zod-to-openapi/node_modules/zod` produced 161 `ZodObject is not assignable to ZodObject` errors. After the bump, `tsc --noEmit` is clean without any change to the existing `extendZodWithOpenApi(z)` pattern. The work historically planned as "the zod thing for phase 2" is now substantially unnecessary — confirm before scoping that work.

2. **`@types/bun` 1.3.4 → 1.3.14** exposed two type breakages:
   - `apps/backend/src/index.ts`: `import type { Serve } from 'bun'; ... satisfies Serve` no longer works (`Serve` is a namespace, not a usable type). Fixed: removed the import, switched to `satisfies Bun.Serve.Options<undefined>`.
   - `apps/backend/src/utils/logger.ts`: `public log(...args: Parameters<typeof console.log>)` style methods no longer spread cleanly into `logLogic(level, message, ...args)` because the new console type isn't a tuple. Fixed: explicit `(message: string, ...args: unknown[])` signatures on `log/info/warn/error/debug`.

3. **TypeScript 5.9.3 → 6.0.3** flagged `compilerOptions.baseUrl` as deprecated (`TS5101`). Suppressed for now via `"ignoreDeprecations": "6.0"` in `apps/backend/tsconfig.json`. Must be properly resolved before TS 7 — remove `baseUrl`, verify the `paths: { "*/": ["./src/*"] }` mapping still resolves without it. Treat this as a phase-2 (code-structure) follow-up.

## Follow-up: react19 eslint plugins bumped alongside

The initial sweep deferred `eslint` 9→10 because the existing `@eslint-react/eslint-plugin@2.0.4` (and its transitive `@eslint-react/ast → @typescript-eslint/utils`) loaded at the top of `eslint.config.mjs` and crashed under ESLint 10. The follow-up: bump the react19 dev deps to versions that support ESLint 10, then bump eslint itself.

| Package (react19 devDeps) | Before | After |
|---|---|---|
| @eslint-react/eslint-plugin | 2.0.4 | 5.7.7 |
| @tanstack/eslint-plugin-query | 5.91.0 | 5.100.10 |
| eslint-plugin-react-hooks | ^5.2.0 | ^7.1.1 |
| eslint-plugin-react-refresh | ^0.4.20 | ^0.5.2 |

After this, eslint 10.3.0 + @eslint/js 10.0.1 install and run cleanly. `bunx eslint apps/backend/src/**/*.ts` and `bunx eslint apps/react19/src/**/*.{ts,tsx}` both complete with 0 errors (a handful of warnings, mostly `react-refresh/only-export-components` on tanstack-router route files that export `Route` alongside the component — expected pattern).

## Deferred

1. **TS-6 `baseUrl` deprecation** in `apps/backend/tsconfig.json` — silenced via `ignoreDeprecations`, must be cleaned up in phase 2.

## Verification

- Clean install (`rm -rf node_modules apps/*/node_modules bun.lock` → `bun install`) succeeds.
- `bunx tsc -p apps/backend/tsconfig.json --noEmit` is clean (0 errors).
- Backend boots on `PORT=3091`, Scalar docs respond, BetterAuth + each resource router (`tasks`, `labels`, `projects`, `reminders`) returns the expected 200/401.

## Files modified

- `/package.json`
- `/apps/backend/package.json`
- `/apps/backend/tsconfig.json` — added `"ignoreDeprecations": "6.0"`.
- `/apps/backend/src/index.ts` — `Serve` import + `satisfies` annotation.
- `/apps/backend/src/utils/logger.ts` — public method signatures.
- `/bun.lock` — refreshed.

`/eslint.config.mjs` was inspected but **not** modified — config shape stayed compatible across the eslint 9→10 jump.

## Out of scope (still pending)

- `apps/react19/package.json` — only the eslint-related dev deps were bumped as part of unblocking eslint 10; runtime deps (react, tanstack, vite, tailwind, daisyui, zod, etc.) still pending.
- `packages/utils/package.json` deps.
- Backend code structure / drizzle / zod usage modernization (phase 2).
- ESLint / Prettier **config** changes (rule sets, plugins) — phase 2.
- Coding styles, ADRs, best practices — phase 4.
- Vue app planning — phase 5.
