import type { TasksService } from './tasks.service';
import { tasksRoutes } from './tasks.routes';
import type { AppRouteHandler } from '../../types/app_context';
import { EndpointError } from 'utils/errors/http-errors/';

export type TasksController = {
  getTasks: AppRouteHandler<typeof tasksRoutes.getTasks>;
  getTaskById: AppRouteHandler<typeof tasksRoutes.getTaskById>;
  createTask: AppRouteHandler<typeof tasksRoutes.createTask>;
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
      const tasksFound = await tasksService.getTasks({ ...filters, dueDate });
      if (!tasksFound) {
        throw new EndpointError<typeof tasksRoutes.getTasks>('NOT_FOUND', {
          message: 'No tasks found',
        });
      }
      return c.json(
        {
          success: true,
          data: tasksFound,
          message: 'Tasks fetched',
        },
        200,
      );
    },
    getTaskById: async (c) => {
      const { taskId } = c.req.valid('param');
      const taskFound = await tasksService.getTasksById(taskId);

      if (!taskFound) {
        throw new EndpointError<typeof tasksRoutes.getTaskById>('NOT_FOUND', {
          message: 'Task not found',
        });
      }
      return c.json(
        { success: true, data: taskFound, message: 'Task fetched' },
        200,
      );
    },

    createTask: async (c) => {
      const task = c.req.valid('json');
      const createdTask = await tasksService.createTask(task);
      return c.json(
        { success: true, data: createdTask, message: 'Task created' },
        201,
      );
    },
  };
};
