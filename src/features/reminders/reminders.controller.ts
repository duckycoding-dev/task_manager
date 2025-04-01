import type { RemindersService } from './reminders.service';
import { remindersRoutes } from './reminders.routes';
import type { AppRouteHandler } from '../../types/app_context';
import { EndpointError } from 'utils/errors/http-errors/';

export type RemindersController = {
  getReminders: AppRouteHandler<typeof remindersRoutes.getReminders>;
  getReminderById: AppRouteHandler<typeof remindersRoutes.getReminderById>;
  getRemindersByTaskId: AppRouteHandler<
    typeof remindersRoutes.getRemindersByTaskId
  >;
  createReminder: AppRouteHandler<typeof remindersRoutes.createReminder>;
  updateReminder: AppRouteHandler<typeof remindersRoutes.updateReminder>;
  deleteReminder: AppRouteHandler<typeof remindersRoutes.deleteReminder>;
};

export const createRemindersController = (
  remindersService: RemindersService,
): RemindersController => {
  return {
    getReminderById: async (c) => {
      const { id } = c.req.valid('param');
      const reminderFound = await remindersService.getReminderById(id);
      if (!reminderFound) {
        throw new EndpointError<typeof remindersRoutes.getReminderById>(
          'NOT_FOUND',
          { message: 'Reminder not found' },
        );
      }
      return c.json(
        {
          success: true,
          data: reminderFound,
          message: 'Reminder found',
        },
        200,
      );
    },
    getReminders: async (c) => {
      const reminders = await remindersService.getReminders();
      return c.json(
        {
          success: true,
          data: reminders,
          message: 'Reminders found',
        },
        200,
      );
    },
    getRemindersByTaskId: async (c) => {
      const { taskId } = c.req.valid('param');
      const reminders = await remindersService.getRemindersByTaskId(taskId);
      if (reminders.length === 0) {
        throw new EndpointError<typeof remindersRoutes.getRemindersByTaskId>(
          'NOT_FOUND',
          { message: 'No reminders found for this task' },
        );
      }
      return c.json(
        {
          success: true,
          data: reminders,
          message: 'Reminders found',
        },
        200,
      );
    },

    createReminder: async (c) => {
      const reminder = c.req.valid('json');
      const reminderCreated = await remindersService.createReminder(reminder);
      return c.json(
        {
          success: true,
          data: reminderCreated,
          message: 'Reminder created',
        },
        201,
      );
    },

    updateReminder: async (c) => {
      const { id } = c.req.valid('param');
      const reminderUpdate = c.req.valid('json');
      const reminderUpdated = await remindersService.updateReminder(
        id,
        reminderUpdate,
      );
      if (!reminderUpdated) {
        throw new EndpointError<typeof remindersRoutes.updateReminder>(
          'NOT_FOUND',
          { message: 'Reminder not found' },
        );
      }
      return c.json(
        {
          success: true,
          data: reminderUpdated,
          message: 'Reminder updated',
        },
        200,
      );
    },
    deleteReminder: async (c) => {
      const { id } = c.req.valid('param');
      const reminderDeleted = await remindersService.deleteReminder(id);
      if (!reminderDeleted) {
        throw new EndpointError<typeof remindersRoutes.deleteReminder>(
          'NOT_FOUND',
          { message: 'Reminder not found' },
        );
      }
      return c.json(
        {
          success: true,
          data: null,
          message: 'Reminder deleted',
        },
        200,
      );
    },
  };
};
