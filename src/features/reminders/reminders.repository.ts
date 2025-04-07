import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, eq } from 'drizzle-orm';
import {
  selectReminderSchema,
  reminders,
  type Reminder,
  type InsertReminder,
  type UpdateReminder,
} from './reminders.db';
import { formatZodError } from 'utils/mapping/';
import { RepositoryValidationError } from 'utils/errors/domain-errors/';

export type RemindersRepository = {
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

export const createRemindersRepository = (
  db: PostgresJsDatabase,
): RemindersRepository => {
  return {
    getReminderById: async (userId, id) => {
      const res = await db
        .select()
        .from(reminders)
        .where(and(eq(reminders.userId, userId), eq(reminders.id, id)));
      if (res.length === 0) {
        return undefined;
      }

      const parsed = selectReminderSchema.safeParse(res[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },
    getReminders: async (userId) => {
      const res = await db
        .select()
        .from(reminders)
        .where(eq(reminders.userId, userId));
      const parsed = selectReminderSchema.array().safeParse(res);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },
    getRemindersByTaskId: async (userId, taskId) => {
      const res = await db
        .select()
        .from(reminders)
        .where(and(eq(reminders.userId, userId), eq(reminders.taskId, taskId)));
      const parsed = selectReminderSchema.array().safeParse(res);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },
    createReminder: async (userId, newReminder) => {
      const createdReminder = await db
        .insert(reminders)
        .values({ ...newReminder, userId })
        .returning();

      const parsed = selectReminderSchema.safeParse(createdReminder);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },
    updateReminder: async (userId, id, reminder) => {
      const updatedReminder = await db
        .update(reminders)
        .set(reminder)
        .where(and(eq(reminders.userId, userId), eq(reminders.id, id)))
        .returning();
      const parsed = selectReminderSchema.safeParse(updatedReminder[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },
    deleteReminder: async (userId, id) => {
      const deletedReminder = await db
        .delete(reminders)
        .where(and(eq(reminders.userId, userId), eq(reminders.id, id)))
        .returning();
      if (deletedReminder.length === 0) {
        return false;
      }
      return true;
    },
  };
};
