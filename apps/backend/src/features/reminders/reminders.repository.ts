import { and, eq, gte, inArray, isNull, lte } from 'drizzle-orm';
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
import type { GetRemindersQuery } from './reminders.types';

export type RemindersRepository = {
  getReminders: (
    userId: string,
    filters: GetRemindersQuery,
  ) => Promise<Reminder[]>;
  getReminderById: (
    userId: string,
    id: string,
    opts?: { includeDeleted?: boolean },
  ) => Promise<Reminder | undefined>;
  restoreReminder: (
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
  ) => Promise<Reminder | undefined>;
  deleteReminder: (userId: string, id: string) => Promise<boolean>;
};

export const createRemindersRepository = (
  db: PostgresJsDatabase,
): RemindersRepository => {
  return {
    getReminderById: async (userId, id, opts) => {
      const conditions = [
        eq(remindersModel.userId, userId),
        eq(remindersModel.id, id),
      ];
      if (!opts?.includeDeleted)
        conditions.push(isNull(remindersModel.deletedAt));
      const res = await db
        .select()
        .from(remindersModel)
        .where(and(...conditions));
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
    restoreReminder: async (userId, id) => {
      // Nulls `deletedAt`. No `deletedAt IS NOT NULL` guard — restoring a
      // live row is an idempotent success. 0 rows = reminder doesn't exist.
      const restored = await db
        .update(remindersModel)
        .set({ deletedAt: null })
        .where(
          and(eq(remindersModel.userId, userId), eq(remindersModel.id, id)),
        )
        .returning();
      if (restored.length === 0) {
        return undefined;
      }
      const parsed = selectReminderSchema.safeParse(restored[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(restored[0], parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },
    getReminders: async (userId, filters) => {
      const { taskId, remindAtGte, remindAtLte, includeDeleted } = filters;

      const conditions = [eq(remindersModel.userId, userId)];
      // Multi-value filter: OR within the field (inArray).
      if (taskId?.length)
        conditions.push(inArray(remindersModel.taskId, taskId));
      if (remindAtGte)
        conditions.push(gte(remindersModel.remindAt, remindAtGte));
      if (remindAtLte)
        conditions.push(lte(remindersModel.remindAt, remindAtLte));
      if (!includeDeleted) conditions.push(isNull(remindersModel.deletedAt));

      const res = await db
        .select()
        .from(remindersModel)
        .where(and(...conditions));
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
            isNull(remindersModel.deletedAt),
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
          and(
            eq(remindersModel.userId, userId),
            eq(remindersModel.id, id),
            isNull(remindersModel.deletedAt),
          ),
        )
        .returning();
      if (updatedReminder.length === 0) {
        return undefined;
      }
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
      // Soft delete: stamp `deleted_at`. Per ADR-0002.
      const updated = await db
        .update(remindersModel)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(remindersModel.userId, userId),
            eq(remindersModel.id, id),
            isNull(remindersModel.deletedAt),
          ),
        )
        .returning({ id: remindersModel.id });
      return updated.length > 0;
    },
  };
};
