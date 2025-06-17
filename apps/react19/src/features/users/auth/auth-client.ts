import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: `http://localhost:${import.meta.env.VITE_BACKEND_PORT}`, // The base URL of your auth server
  basePath: '/auth',
  fetchOptions: {},
});
