import { sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { type z } from 'zod/v4';

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from '../../utils/drizzle-zod';
import { users } from '../auth/auth.db';
import { tasks } from '../tasks/tasks.db';

// 🚀 Reminders Table (Task Notifications)
export const remindersModel = pgTable(
  'reminders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }), // From BetterAuth
    title: text('title').notNull(),
    content: text('content').notNull(),
    remindAt: timestamp('remind_at').notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (t) => [
    // Partial index per ADR-0002. See tasks.db.ts for rationale.
    index('idx_reminders_user_active')
      .on(t.userId)
      .where(sql`${t.deletedAt} IS NULL`),
  ],
);

// 📌 Select Schema (for response data)
export const selectReminderSchema = createSelectSchema(remindersModel);

// 📌 Insert Schema (for creating reminders)
export const insertReminderSchema = createInsertSchema(remindersModel).omit({
  id: true, // ID is auto-generated
  userId: true,
  deletedAt: true, // server-controlled via soft-delete write path
});

// 📌 Update Schema (for partial updates)
export const updateReminderSchema = createUpdateSchema(remindersModel).omit({
  id: true,
  userId: true,
  deletedAt: true, // server-controlled via soft-delete write path
});

// 🔹 Types
export type Reminder = z.infer<typeof selectReminderSchema>;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type UpdateReminder = z.infer<typeof updateReminderSchema>;
