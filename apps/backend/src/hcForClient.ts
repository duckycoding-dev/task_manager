import type { AppType } from './app';
import { hc } from 'hono/client';
import type { Client } from './hc';

// separate file to avoid importing code that uses process.env in the client side code
// this hono client crator is used in the frontend apps to make requests to the backend by providing the base URL of the backend server.
// the other one, which is defined in `apps/backend/src/hc.ts` is used in the backend code to make requests to the backend server itself: it is ready to use as the url is provided at build time from the env file.

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<AppType>(...args);
