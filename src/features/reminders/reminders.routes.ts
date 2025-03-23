import { createRoute, z } from '@hono/zod-openapi';
import type { AppRoutes } from '../../types/app_context';
import { remindersSchema } from './reminders.db';

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
          schema: remindersSchema,
        },
      },
    },
  },
});

// Method	Endpoint	Description
// POST	/tasks/:taskId/reminders	Set a reminder for a task
// GET	/tasks/:taskId/reminders	Get all reminders for a task
// DELETE	/tasks/:taskId/reminders/:reminderId	Remove a reminder

export const remindersRoutes = {
  get,
} as const satisfies AppRoutes;
