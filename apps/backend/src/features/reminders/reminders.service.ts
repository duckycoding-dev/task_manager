import type { RemindersRepository } from './reminders.repository';
import type { InsertReminder, Reminder, UpdateReminder } from './reminders.db';

export type RemindersService = {
  getReminders: (userId: string) => Promise<Reminder[]>;
  getReminderById: (
    userId: string,
    id: string,
  ) => Promise<Reminder | undefined>;
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
  deleteReminder: (userId: string, id: string) => Promise<boolean>;
};

export const createRemindersService = (
  remindersRepository: RemindersRepository,
): RemindersService => {
  return {
    getReminderById: async (userId, id) => {
      return await remindersRepository.getReminderById(userId, id);
    },
    getReminders: async (userId) => {
      return await remindersRepository.getReminders(userId);
    },
    getRemindersByTaskId: async (userId, taskId) => {
      return await remindersRepository.getRemindersByTaskId(userId, taskId);
    },
    createReminder: async (userId, newReminder) => {
      return await remindersRepository.createReminder(userId, newReminder);
    },
    updateReminder: async (userId, id, reminder) => {
      return await remindersRepository.updateReminder(userId, id, reminder);
    },
    deleteReminder: async (userId, id) => {
      return await remindersRepository.deleteReminder(userId, id);
    },
  };
};
