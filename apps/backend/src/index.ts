import { app } from './app';
import env from './utils/env';
import type { Serve } from 'bun';

export default {
  port: env.PORT,
  fetch: app.fetch,
} satisfies Serve;
