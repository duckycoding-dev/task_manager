import { hcWithType } from '@task-manager/backend/hc';

export const HonoClient = hcWithType(
  `http://localhost:${import.meta.env.VITE_BACKEND_PORT}`,
  {
    fetch: (
      input: Parameters<typeof fetch>[0],
      init: Parameters<typeof fetch>[1],
    ) => {
      return fetch(input, {
        ...init,
        credentials: 'include', // Required for sending cookies cross-origin
      });
    },
  },
);
