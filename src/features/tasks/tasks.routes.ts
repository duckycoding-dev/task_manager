import { createRoute, z } from '@hono/zod-openapi';
import type { AppRoutes } from '../../types/app_context';
import { tasksSchema } from './tasks.db';

const getTask = createRoute({
  path: '/:id',
  method: 'get',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: tasksSchema,
        },
      },
    },
  },
});

export const tasksRoutes = {
  getTask,
} as const satisfies AppRoutes;
