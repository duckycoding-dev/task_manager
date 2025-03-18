import type { TasksService } from './tasks.service';
import { tasksRoutes } from './tasks.routes';
import type { AppRouteHandler } from '../../types/app_context';

export type TasksController = {
  getTask: AppRouteHandler<typeof tasksRoutes.getTask>;
  // ... other methods
};

export const createTasksController = (
  tasksService: TasksService,
): TasksController => {
  return {
    getTask: async (c) => {
      const { id } = c.req.valid('param');
      const result = await tasksService.getTask(id);
      return c.json(result);
    },
  };
};
