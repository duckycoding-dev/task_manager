import type { AppType } from './app';
import { hc } from 'hono/client';
import env from './utils/env';

// https://hono.dev/docs/guides/rpc#compile-your-code-before-using-it-recommended

// this is a trick to calculate the type when compiling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = hc<AppType>(`http://localhost:${env.PORT}`);
type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<AppType>(...args);
