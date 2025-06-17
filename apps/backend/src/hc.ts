import type { AppType } from './app';
import { hc } from 'hono/client';
import env from './utils/env';

// https://hono.dev/docs/guides/rpc#compile-your-code-before-using-it-recommended

// this is a trick to calculate the type when compiling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = hc<AppType>(`http://localhost:${env.PORT}`, {
  fetch: (
    input: Parameters<typeof fetch>[0],
    init: Parameters<typeof fetch>[1],
  ) => {
    return fetch(input, {
      ...init,
      credentials: 'include', // Required for sending cookies cross-origin
    });
  }, // satisfies typeof fetch, // explained here: https://www.better-auth.com/docs/integrations/hono#client-side-configuration
});

export type Client = typeof client;

// import type { AppType } from './app';
// import { hc } from 'hono/client';
// import env from './utils/env';

// // https://hono.dev/docs/guides/rpc#compile-your-code-before-using-it-recommended

// // this is a trick to calculate the type when compiling
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const client = (...args: Parameters<typeof hc>) =>
//   hc<AppType>(args[0], {
//     fetch: (
//       input: Parameters<typeof fetch>[0],
//       init: Parameters<typeof fetch>[1],
//     ) => {
//       return fetch(input, {
//         ...init,
//         credentials: 'include', // Required for sending cookies cross-origin
//       });
//     }, // satisfies typeof fetch, // explained here: https://www.better-auth.com/docs/integrations/hono#client-side-configuration
//     ...args[1],
//   });

// type Client = ReturnType<typeof client>;

// export const hcWithType = (...args: Parameters<typeof hc>): Client =>
//   hc<AppType>(...args);
