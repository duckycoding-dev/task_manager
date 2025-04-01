import type { RemindersRepository } from './reminders.repository';
import type { InsertReminder, Reminder, UpdateReminder } from './reminders.db';

export type RemindersService = {
  getReminders: () => Promise<Reminder[]>;
  getReminderById: (id: string) => Promise<Reminder | undefined>;
  getRemindersByTaskId: (taskId: string) => Promise<Reminder[]>;
  createReminder: (newReminder: InsertReminder) => Promise<Reminder>;
  updateReminder: (id: string, reminder: UpdateReminder) => Promise<Reminder>;
  deleteReminder: (id: string) => Promise<boolean>;
};

export const createRemindersService = (
  remindersRepository: RemindersRepository,
): RemindersService => {
  return {
    getReminderById: async (id) => {
      return await remindersRepository.getReminderById(id);
    },
    getReminders: async () => {
      return await remindersRepository.getReminders();
    },
    getRemindersByTaskId: async (taskId) => {
      return await remindersRepository.getRemindersByTaskId(taskId);
    },
    createReminder: async (newReminder) => {
      return await remindersRepository.createReminder(newReminder);
    },
    updateReminder: async (id, reminder) => {
      return await remindersRepository.updateReminder(id, reminder);
    },
    deleteReminder: async (id) => {
      return await remindersRepository.deleteReminder(id);
    },
  };
};
