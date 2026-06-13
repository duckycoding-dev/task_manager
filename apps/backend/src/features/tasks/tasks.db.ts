import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { type z } from 'zod/v4';

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from '../../utils/drizzle-zod';
import { users } from '../auth/auth.db';
import { projects } from '../projects/projects.db';

// 🔹 Define Enums as `const` arrays
export const STATUS_OPTIONS = ['todo', 'in_progress', 'done'] as const;
export const PRIORITY_OPTIONS = ['low', 'medium', 'high'] as const;
export const RECURRING_OPTIONS = [
  'daily',
  'weekly',
  'monthly',
  'none',
] as const;

// 🔹 Drizzle Schema Definition
export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }), // From BetterAuth
    projectId: uuid('project_id').references(() => projects.id, {
      onDelete: 'set null',
    }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: STATUS_OPTIONS }).default('todo').notNull(),
    priority: text('priority', { enum: PRIORITY_OPTIONS })
      .default('medium')
      .notNull(),
    dueDate: timestamp('due_date'),
    isRecurring: boolean('is_recurring').default(false),
    recurringInterval: text('recurring_interval', { enum: RECURRING_OPTIONS })
      .default('none')
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (t) => [
    // Partial index: speeds up the default `deleted_at IS NULL` scan on
    // per-user lists. Soft-deleted rows aren't in the index. Per ADR-0002.
    index('idx_tasks_user_active')
      .on(t.userId)
      .where(sql`${t.deletedAt} IS NULL`),
  ],
);

// 📌 Select Schema (for response data)
export const selectTaskSchema = createSelectSchema(tasks);

// 📌 Insert Schema (for creating tasks)
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true, // ID is auto-generated
  userId: true, // User ID is set from the session
  createdAt: true,
  updatedAt: true,
  deletedAt: true, // server-controlled via soft-delete write path
});

// 📌 Update Schema (for partial updates)
export const updateTaskSchema = createUpdateSchema(tasks).omit({
  id: true,
  userId: true, // User ID is set from the session
  createdAt: true,
  deletedAt: true, // server-controlled via soft-delete write path
});

// 🔹 Types
export type Task = z.infer<typeof selectTaskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
