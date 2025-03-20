import { createRoute, z } from '@hono/zod-openapi';
import type { AppRoutes } from '../../types/app_context';
import { {{nameCamel}}Schema } from './{{nameCamel}}.db';

const get = createRoute({
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
          schema: {{nameCamel}}Schema,
        },
      },
    },
  },
});

export const {{nameCamel}}Routes = {
  get,
} as const satisfies AppRoutes;
