import { AUTH_CTX_KEYS } from 'utils/auth-context/';

import type { AppRouteHandler } from '../../types/app_context';

import { type remindersRoutes } from './reminders.routes';
import type { RemindersService } from './reminders.service';

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
      const { reminderId } = c.req.valid('param');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const reminderFound = await remindersService.getReminderById(
        userId,
        reminderId,
      );
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
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
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
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
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
      const { reminderId } = c.req.valid('param');
      const reminderUpdate = c.req.valid('json');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const reminderUpdated = await remindersService.updateReminder(
        userId,
        reminderId,
        reminderUpdate,
      );
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
      const { reminderId } = c.req.valid('param');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      await remindersService.deleteReminder(userId, reminderId);
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
