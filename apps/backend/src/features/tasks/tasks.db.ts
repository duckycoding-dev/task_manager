import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { type z } from 'zod/v4';

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from '../../utils/drizzle-zod';
import { users } from '../auth/auth.db';
import { projects } from '../projects/projects.db';

// 🔹 Define Enums as `const` arrays
export const statusOptions = ['todo', 'in_progress', 'done'] as const;
export const priorityOptions = ['low', 'medium', 'high'] as const;
export const recurringOptions = ['daily', 'weekly', 'monthly', 'none'] as const;

// 🔹 Drizzle Schema Definition
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // From BetterAuth
  projectId: uuid('project_id').references(() => projects.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: statusOptions }).default('todo').notNull(),
  priority: text('priority', { enum: priorityOptions })
    .default('medium')
    .notNull(),
  dueDate: timestamp('due_date'),
  isRecurring: boolean('is_recurring').default(false),
  recurringInterval: text('recurring_interval', { enum: recurringOptions })
    .default('none')
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 📌 Select Schema (for response data)
export const selectTaskSchema = createSelectSchema(tasks);

// 📌 Insert Schema (for creating tasks)
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true, // ID is auto-generated
  userId: true, // User ID is set from the session
  createdAt: true,
  updatedAt: true,
});

// 📌 Update Schema (for partial updates)
export const updateTaskSchema = createUpdateSchema(tasks).omit({
  id: true,
  userId: true, // User ID is set from the session
  createdAt: true,
});

// 🔹 Types
export type Task = z.infer<typeof selectTaskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
