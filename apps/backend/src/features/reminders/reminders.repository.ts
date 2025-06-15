import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, eq } from 'drizzle-orm';
import {
  selectReminderSchema,
  remindersModel,
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
        .from(remindersModel)
        .where(
          and(eq(remindersModel.userId, userId), eq(remindersModel.id, id)),
        );
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
        .from(remindersModel)
        .where(eq(remindersModel.userId, userId));
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
        .from(remindersModel)
        .where(
          and(
            eq(remindersModel.userId, userId),
            eq(remindersModel.taskId, taskId),
          ),
        );
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
        .insert(remindersModel)
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
        .update(remindersModel)
        .set(reminder)
        .where(
          and(eq(remindersModel.userId, userId), eq(remindersModel.id, id)),
        )
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
        .delete(remindersModel)
        .where(
          and(eq(remindersModel.userId, userId), eq(remindersModel.id, id)),
        )
        .returning();
      if (deletedReminder.length === 0) {
        return false;
      }
      return true;
    },
  };
};
