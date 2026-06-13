import { EntityNotFoundError } from 'utils/errors/domain-errors/';

import type { InsertReminder, Reminder, UpdateReminder } from './reminders.db';
import type { RemindersRepository } from './reminders.repository';
import type { GetRemindersQuery } from './reminders.types';

export type RemindersService = {
  getReminders: (
    userId: string,
    filters: GetRemindersQuery,
  ) => Promise<Reminder[]>;
  getReminderById: (userId: string, id: string) => Promise<Reminder>;
  getRemindersByTaskId: (userId: string, taskId: string) => Promise<Reminder[]>;
  createReminder: (
    userId: string,
    newReminder: InsertReminder,
  ) => Promise<Reminder>;
  updateReminder: (
    userId: string,
    id: string,
    reminder: UpdateReminder,
  ) => Promise<Reminder>;
  deleteReminder: (userId: string, id: string) => Promise<void>;
};

export const createRemindersService = (
  remindersRepository: RemindersRepository,
): RemindersService => {
  return {
    getReminderById: async (userId, id) => {
      const reminder = await remindersRepository.getReminderById(userId, id);
      if (!reminder) throw new EntityNotFoundError('Reminder', id);
      return reminder;
    },
    getReminders: async (userId, filters) => {
      return await remindersRepository.getReminders(userId, filters);
    },
    getRemindersByTaskId: async (userId, taskId) => {
      return await remindersRepository.getRemindersByTaskId(userId, taskId);
    },
    createReminder: async (userId, newReminder) => {
      return await remindersRepository.createReminder(userId, newReminder);
    },
    updateReminder: async (userId, id, reminder) => {
      const updated = await remindersRepository.updateReminder(
        userId,
        id,
        reminder,
      );
      if (!updated) throw new EntityNotFoundError('Reminder', id);
      return updated;
    },
    deleteReminder: async (userId, id) => {
      const deleted = await remindersRepository.deleteReminder(userId, id);
      if (!deleted) throw new EntityNotFoundError('Reminder', id);
    },
  };
};
