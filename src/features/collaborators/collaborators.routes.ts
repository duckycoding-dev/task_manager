import { createRoute, z } from '@hono/zod-openapi';
import type { AppRoutes } from '../../types/app_context';
import { collaboratorsSchema } from './collaborators.db';

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
          schema: collaboratorsSchema,
        },
      },
    },
  },
});

// Method	Endpoint	Description
// POST	/tasks/:taskId/collaborators	Add a collaborator to a task
// GET	/tasks/:taskId/collaborators	Get all collaborators for a task
// PATCH	/tasks/:taskId/collaborators/:collaboratorId	Change collaborator role (editor, viewer)
// DELETE	/tasks/:taskId/collaborators/:collaboratorId	Remove a collaborator

export const collaboratorsRoutes = {
  get,
} as const satisfies AppRoutes;
