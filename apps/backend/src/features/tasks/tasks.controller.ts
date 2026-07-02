import { AUTH_CTX_KEYS } from 'utils/auth-context/';

import type { AppRouteHandler } from '../../types/app_context';

import { type tasksRoutes } from './tasks.routes';
import type { TasksService } from './tasks.service';

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
  updateTaskStatus: AppRouteHandler<typeof tasksRoutes.updateTaskStatus>;
  restoreTask: AppRouteHandler<typeof tasksRoutes.restoreTask>;
  getTaskReminders: AppRouteHandler<typeof tasksRoutes.getTaskReminders>;
};

export const createTasksController = (
  tasksService: TasksService,
): TasksController => {
  return {
    getTasks: async (c) => {
      const filters = c.req.valid('query');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const tasksFound = await tasksService.getTasks(userId, filters);

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
      const { includeDeleted } = c.req.valid('query');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const taskFound = await tasksService.getTaskById(userId, taskId, {
        includeDeleted,
      });
      return c.json(
        { success: true, data: taskFound, message: 'Task fetched' },
        200,
      );
    },

    restoreTask: async (c) => {
      const { taskId } = c.req.valid('param');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const restoredTask = await tasksService.restoreTask(userId, taskId);
      return c.json(
        { success: true, data: restoredTask, message: 'Task restored' },
        200,
      );
    },

    createTask: async (c) => {
      const task = c.req.valid('json');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const createdTask = await tasksService.createTask(userId, task);
      return c.json(
        { success: true, data: createdTask, message: 'Task created' },
        201,
      );
    },

    updateTask: async (c) => {
      const { taskId } = c.req.valid('param');
      const task = c.req.valid('json');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const updatedTask = await tasksService.updateTask(userId, taskId, task);
      return c.json(
        { success: true, data: updatedTask, message: 'Task updated' },
        200,
      );
    },

    deleteTask: async (c) => {
      const { taskId } = c.req.valid('param');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      await tasksService.deleteTask(userId, taskId);
      return c.json({ success: true, message: 'Task deleted' }, 200);
    },

    updateTaskPriority: async (c) => {
      const { taskId } = c.req.valid('param');
      const priority = c.req.valid('json');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const updatedTask = await tasksService.updateTaskPriority(
        userId,
        taskId,
        priority,
      );
      return c.json(
        { success: true, data: updatedTask, message: 'Task updated' },
        200,
      );
    },

    updateTaskRecurringInterval: async (c) => {
      const { taskId } = c.req.valid('param');
      const recurringInterval = c.req.valid('json');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const updatedTask = await tasksService.updateTaskRecurringInterval(
        userId,
        taskId,
        recurringInterval,
      );
      return c.json(
        { success: true, data: updatedTask, message: 'Task updated' },
        200,
      );
    },

    updateTaskStatus: async (c) => {
      const { taskId } = c.req.valid('param');
      const status = c.req.valid('json');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const updatedTask = await tasksService.updateTaskStatus(
        userId,
        taskId,
        status,
      );
      return c.json(
        { success: true, data: updatedTask, message: 'Task updated' },
        200,
      );
    },

    getTaskReminders: async (c) => {
      const { taskId } = c.req.valid('param');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
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
