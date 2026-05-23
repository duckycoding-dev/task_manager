import env from './utils/env';
import { app } from './app';

export default {
  port: env.PORT,
  fetch: app.fetch,
} satisfies Bun.Serve.Options<undefined>;
