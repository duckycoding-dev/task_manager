import type { TasksService } from './tasks.service';
import { tasksRoutes } from './tasks.routes';
import type { AppRouteHandler } from '../../types/app_context';
import { EndpointError } from 'utils/errors/http-errors/';

export type TasksController = {
  getTasks: AppRouteHandler<typeof tasksRoutes.getTasks>;
  getTaskById: AppRouteHandler<typeof tasksRoutes.getTaskById>;
  createTask: AppRouteHandler<typeof tasksRoutes.createTask>;
  updateTask: AppRouteHandler<typeof tasksRoutes.updateTask>;
  deleteTask: AppRouteHandler<typeof tasksRoutes.deleteTask>;
  updateTaskPriority: AppRouteHandler<typeof tasksRoutes.updateTaskPriority>;
  updateTaskRecurringInterval: AppRouteHandler<
    typeof tasksRoutes.updateTaskRecurringInterval
  >;
  updateTaskIsRecurring: AppRouteHandler<
    typeof tasksRoutes.updateTaskIsRecurring
  >;
  updateTaskStatus: AppRouteHandler<typeof tasksRoutes.updateTaskStatus>;
  getTaskReminders: AppRouteHandler<typeof tasksRoutes.getTaskReminders>;
};

export const createTasksController = (
  tasksService: TasksService,
): TasksController => {
  return {
    getTasks: async (c) => {
      const filters = c.req.valid('query');
      const { id: userId } = c.get('user');
      const dueDate = filters.dueDate ? new Date(filters.dueDate) : undefined;
      const tasksFound = await tasksService.getTasks(userId, {
        ...filters,
        dueDate,
      });

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
      const { id: userId } = c.get('user');
      const taskFound = await tasksService.getTasksById(userId, taskId);

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
      const { id: userId } = c.get('user');
      const createdTask = await tasksService.createTask(userId, task);
      return c.json(
        { success: true, data: createdTask, message: 'Task created' },
        201,
      );
    },

    updateTask: async (c) => {
      const { taskId } = c.req.valid('param');
      const task = c.req.valid('json');
      const { id: userId } = c.get('user');
      const updatedTask = await tasksService.updateTask(userId, taskId, task);
      if (!updatedTask) {
        throw new EndpointError<typeof tasksRoutes.updateTask>('NOT_FOUND', {
          message: 'Task not found',
        });
      }
      return c.json(
        { success: true, data: updatedTask, message: 'Task updated' },
        200,
      );
    },

    deleteTask: async (c) => {
      const { taskId } = c.req.valid('param');
      const { id: userId } = c.get('user');
      const deleted = await tasksService.deleteTask(userId, taskId);
      if (!deleted) {
        throw new EndpointError<typeof tasksRoutes.deleteTask>('NOT_FOUND', {
          message: 'Task not found',
        });
      }
      return c.json({ success: true, message: 'Task deleted' }, 200);
    },

    updateTaskPriority: async (c) => {
      const { taskId } = c.req.valid('param');
      const priority = c.req.valid('json');
      const { id: userId } = c.get('user');
      const updatedTask = await tasksService.updateTaskPriority(
        userId,
        taskId,
        priority,
      );
      if (!updatedTask) {
        throw new EndpointError<typeof tasksRoutes.updateTaskPriority>(
          'NOT_FOUND',
          {
            message: 'Task not found',
          },
        );
      }
      return c.json(
        { success: true, data: updatedTask, message: 'Task updated' },
        200,
      );
    },

    updateTaskRecurringInterval: async (c) => {
      const { taskId } = c.req.valid('param');
      const recurringInterval = c.req.valid('json');
      const { id: userId } = c.get('user');
      const updatedTask = await tasksService.updateTaskRecurringInterval(
        userId,
        taskId,
        recurringInterval,
      );
      if (!updatedTask) {
        throw new EndpointError<typeof tasksRoutes.updateTaskRecurringInterval>(
          'NOT_FOUND',
          {
            message: 'Task not found',
          },
        );
      }
      return c.json(
        { success: true, data: updatedTask, message: 'Task updated' },
        200,
      );
    },

    updateTaskIsRecurring: async (c) => {
      const { taskId } = c.req.valid('param');
      const isRecurring = c.req.valid('json');
      const { id: userId } = c.get('user');
      const updatedTask = await tasksService.updateTaskIsRecurring(
        userId,
        taskId,
        isRecurring,
      );
      if (!updatedTask) {
        throw new EndpointError<typeof tasksRoutes.updateTaskIsRecurring>(
          'NOT_FOUND',
          {
            message: 'Task not found',
          },
        );
      }
      return c.json(
        { success: true, data: updatedTask, message: 'Task updated' },
        200,
      );
    },

    updateTaskStatus: async (c) => {
      const { taskId } = c.req.valid('param');
      const status = c.req.valid('json');
      const { id: userId } = c.get('user');
      const updatedTask = await tasksService.updateTaskStatus(
        userId,
        taskId,
        status,
      );
      if (!updatedTask) {
        throw new EndpointError<typeof tasksRoutes.updateTaskStatus>(
          'NOT_FOUND',
          {
            message: 'Task not found',
          },
        );
      }
      return c.json(
        { success: true, data: updatedTask, message: 'Task updated' },
        200,
      );
    },

    getTaskReminders: async (c) => {
      const { taskId } = c.req.valid('param');
      const { id: userId } = c.get('user');
      const reminders = await tasksService.getTaskReminders(userId, taskId);

      return c.json(
        {
          success: true,
          data: reminders,
          message: 'Reminders found',
        },
        200,
      );
    },
  };
};
