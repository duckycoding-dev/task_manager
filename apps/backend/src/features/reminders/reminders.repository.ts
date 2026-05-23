import { and, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { RepositoryValidationError } from 'utils/errors/domain-errors/';
import { formatZodError } from 'utils/mapping/';

import {
  type InsertReminder,
  type Reminder,
  remindersModel,
  selectReminderSchema,
  type UpdateReminder,
} from './reminders.db';

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
      throw new RepositoryValidationError(res[0], parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
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
      throw new RepositoryValidationError(res, parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
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
      throw new RepositoryValidationError(res, parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
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
        createdReminder,
        parsed.error.issues,
        {
          message: formatZodError(parsed.error),
          cause: parsed.error,
        },
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
        updatedReminder[0],
        parsed.error.issues,
        {
          message: formatZodError(parsed.error),
          cause: parsed.error,
        },
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
