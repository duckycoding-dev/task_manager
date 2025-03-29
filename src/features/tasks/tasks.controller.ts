import type { TasksService } from './tasks.service';
import { tasksRoutes } from './tasks.routes';
import type { AppRouteHandler } from '../../types/app_context';
import { sendSuccess } from 'utils/response/';
import { AppError, EndpointError } from 'utils/errors/';
import type {
  HandlerStatusCode,
  ResponseCodes,
  StatusCodeToVerboseCode,
} from 'utils/status-codes/';

export type TasksController = {
  getTasks: AppRouteHandler<typeof tasksRoutes.getTasks>;
  createTask: AppRouteHandler<typeof tasksRoutes.createTask>;
  deleteTask: AppRouteHandler<typeof tasksRoutes.deleteTask>;
  getTaskById: AppRouteHandler<typeof tasksRoutes.getTaskById>;
  updateTask: AppRouteHandler<typeof tasksRoutes.updateTask>;
  updateTaskPriority: AppRouteHandler<typeof tasksRoutes.updateTaskPriority>;
  updateTaskRecurring: AppRouteHandler<typeof tasksRoutes.updateTaskRecurring>;
  updateTaskStatus: AppRouteHandler<typeof tasksRoutes.updateTaskStatus>;
};

export const createTasksController = (
  tasksService: TasksService,
): TasksController => {
  return {
    getTasks: async (c) => {
      const filters = c.req.valid('query');
      const dueDate = filters.dueDate ? new Date(filters.dueDate) : undefined;
      const result = await tasksService.getTasks({ ...filters, dueDate });
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
        return c.json(
          {
            success: false,
            error: 'test',
          },
          404,
        );
      }
      return c.json(
        {
          success: true,
          data: result,
          message: `Task ${taskId} fetched successfully`,
        },
        200,
      );
    },
  };
};
