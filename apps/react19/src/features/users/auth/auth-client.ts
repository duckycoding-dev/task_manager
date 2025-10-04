import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: `http://localhost:${import.meta.env.VITE_BACKEND_PORT}`, // The base URL of your auth server
  basePath: '/auth',
  fetchOptions: {
    credentials: 'include', // not sure if this is actually needed: when working locally it works without it, I wonder online with different domains among frontend and backend if this is needed
  },
});

export const { useSession: useAuthSession } = authClient;

export type AuthData = ReturnType<typeof useAuthSession>['data'];
