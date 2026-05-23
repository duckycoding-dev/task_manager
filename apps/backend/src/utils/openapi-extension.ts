// BOOT MODULE: top-level side effect is intentional.
//
// Registers `.openapi()` on Zod prototypes via `extendZodWithOpenApi(z)`.
// Must run before any `*.routes.ts` evaluates its inline `.openapi(...)`
// chains. Imported as a side-effect-only specifier in the per-app entry
// (`src/index.ts`) — that placement guarantees the prototype mutation
// happens before `./app` (and its router imports) load.
//
// See docs/llm/coding-practices.md
// §"`extendZodWithOpenApi(z)` registered once via `utils/openapi-extension.ts`;
// `*.types.ts` stays pure Zod".

import { extendZodWithOpenApi } from '@hono/zod-openapi';
import { z } from 'zod/v4';

extendZodWithOpenApi(z);
