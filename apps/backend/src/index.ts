import { app } from './app';
import env from './utils/env';

export default {
  port: env.PORT,
  fetch: app.fetch,
} satisfies Bun.Serve.Options<undefined>;
