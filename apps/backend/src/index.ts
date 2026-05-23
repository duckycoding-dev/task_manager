// Side-effect-only import: registers `.openapi()` on Zod prototypes
// (extendZodWithOpenApi). MUST precede `./app` so the prototype mutation
// runs before any `*.routes.ts` evaluates its inline `.openapi(...)` chains.
import './utils/openapi-extension';

import { env } from './utils/env';
import { app } from './app';

export default {
  port: env.PORT,
  fetch: app.fetch,
} satisfies Bun.Serve.Options<undefined>;
