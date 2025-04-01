import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
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
  getReminders: () => Promise<Reminder[]>;
  getReminderById: (id: string) => Promise<Reminder | undefined>;
  getRemindersByTaskId: (taskId: string) => Promise<Reminder[]>;
  createReminder: (newReminder: InsertReminder) => Promise<Reminder>;
  updateReminder: (id: string, reminder: UpdateReminder) => Promise<Reminder>;
  deleteReminder: (id: string) => Promise<boolean>;
};

export const createRemindersRepository = (
  db: PostgresJsDatabase,
): RemindersRepository => {
  return {
    getReminderById: async (id) => {
      const res = await db.select().from(reminders).where(eq(reminders.id, id));
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
    getReminders: async () => {
      const res = await db.select().from(reminders);
      const parsed = selectReminderSchema.array().safeParse(res);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },
    getRemindersByTaskId: async (taskId) => {
      const res = await db
        .select()
        .from(reminders)
        .where(eq(reminders.taskId, taskId));
      const parsed = selectReminderSchema.array().safeParse(res);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },
    createReminder: async (newReminder) => {
      const createdReminder = await db
        .insert(reminders)
        .values(newReminder)
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
    updateReminder: async (id, reminder) => {
      const updatedReminder = await db
        .update(reminders)
        .set(reminder)
        .where(eq(reminders.id, id))
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
    deleteReminder: async (id) => {
      const deletedReminder = await db
        .delete(reminders)
        .where(eq(reminders.id, id))
        .returning();
      if (deletedReminder.length === 0) {
        return false;
      }
      return true;
    },
  };
};
