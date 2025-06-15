import type { RemindersService } from './reminders.service';
import { remindersRoutes } from './reminders.routes';
import type { AppRouteHandler } from '../../types/app_context';
import { EndpointError } from 'utils/errors/http-errors/';

export type RemindersController = {
  getReminders: AppRouteHandler<typeof remindersRoutes.getReminders>;
  getReminderById: AppRouteHandler<typeof remindersRoutes.getReminderById>;
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
      const { id: userId } = c.get('user');
      const reminderFound = await remindersService.getReminderById(userId, id);
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
      const { id: userId } = c.get('user');
      const reminders = await remindersService.getReminders(userId);
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
      const { id: userId } = c.get('user');
      const reminderCreated = await remindersService.createReminder(
        userId,
        reminder,
      );
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
      const { id: userId } = c.get('user');
      const reminderUpdated = await remindersService.updateReminder(
        userId,
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
      const { id: userId } = c.get('user');
      const reminderDeleted = await remindersService.deleteReminder(userId, id);
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
