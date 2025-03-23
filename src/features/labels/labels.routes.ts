import { createRoute, z } from '@hono/zod-openapi';
import type { AppRoutes } from '../../types/app_context';
import { labelsSchema } from './labels.db';

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
          schema: labelsSchema,
        },
      },
    },
  },
});

// Method	Endpoint	Description
// POST	/labels	Create a new label
// GET	/labels	Get all labels for the authenticated user
// PATCH	/labels/:labelId	Update a label (name, color)
// DELETE	/labels/:labelId	Delete a label (removes it from tasks as well)
// POST	/tasks/:taskId/labels/:labelId	Assign a label to a task
// DELETE	/tasks/:taskId/labels/:labelId	Remove a label from a task

export const labelsRoutes = {
  get,
} as const satisfies AppRoutes;
