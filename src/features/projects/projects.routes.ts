import { createRoute, z } from '@hono/zod-openapi';
import type { AppRoutes } from '../../types/app_context';
import { projectsSchema } from './projects.db';

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
          schema: projectsSchema,
        },
      },
    },
  },
});

// Method	Endpoint	Description
// POST	/projects	Create a new project
// GET	/projects	Get all projects for the authenticated user
// GET	/projects/:projectId	Get a specific project by ID
// PATCH	/projects/:projectId	Update project details (name, description)
// DELETE	/projects/:projectId	Delete a project (set projectId to NULL in associated tasks)

export const projectsRoutes = {
  get,
} as const satisfies AppRoutes;
