import type { TasksService } from './tasks.service';
import { tasksRoutes } from './tasks.routes';
import type { AppRouteHandler } from '../../types/app_context';
import { EndpointError } from 'utils/errors/';

export type TasksController = {
  getTasks: AppRouteHandler<typeof tasksRoutes.getTasks>;
  getTaskById: AppRouteHandler<typeof tasksRoutes.getTaskById>;
  // createTask: AppRouteHandler<typeof tasksRoutes.createTask>;
  // deleteTask: AppRouteHandler<typeof tasksRoutes.deleteTask>;
  // updateTask: AppRouteHandler<typeof tasksRoutes.updateTask>;
  // updateTaskPriority: AppRouteHandler<typeof tasksRoutes.updateTaskPriority>;
  // updateTaskRecurring: AppRouteHandler<typeof tasksRoutes.updateTaskRecurring>;
  // updateTaskStatus: AppRouteHandler<typeof tasksRoutes.updateTaskStatus>;
};

export const createTasksController = (
  tasksService: TasksService,
): TasksController => {
  return {
    getTasks: async (c) => {
      const filters = c.req.valid('query');
      const dueDate = filters.dueDate ? new Date(filters.dueDate) : undefined;
      const result = await tasksService.getTasks({ ...filters, dueDate });
      //return sendSuccessJson(c, result, 200, 'Tasks fetched successfully'); how I want to send the response without manually typing success: true
      return c.json(
        {
          success: true,
          data: result,
          message: 'Tasks fetched successfully',
        },
        200,
      );
    },
    getTaskById: async (c) => {
      const { taskId } = c.req.valid('param');
      const result = await tasksService.getTasksById(taskId);

      if (!result) {
        throw new EndpointError<typeof tasksRoutes.getTaskById>('NOT_FOUND', {
          message: 'Task not found',
        });
      }
      return c.json(
        { success: true, data: result, message: 'Task fetched successfully' },
        200,
      );
    },
  };
};
