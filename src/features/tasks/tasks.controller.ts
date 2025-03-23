import type { TasksService } from './tasks.service';
import { tasksRoutes } from './tasks.routes';
import type { AppRouteHandler } from '../../types/app_context';

export type TasksController = {
  getTasks: AppRouteHandler<typeof tasksRoutes.getTasks>;
};

export const createTasksController = (
  tasksService: TasksService,
): TasksController => {
  return {
    getTasks: async (c) => {
      const filters = c.req.valid('query');
      const dueDate = filters.dueDate ? new Date(filters.dueDate) : undefined;
      const result = await tasksService.getTasks({ ...filters, dueDate });
      return c.json(result);
    },
  };
};
