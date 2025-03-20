import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { projects } from '../projects/projects.db';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from '../auth/auth.db';

// 🚀 Tasks Table (Core Task Management)
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
  status: text('status', { enum: ['todo', 'in_progress', 'done'] })
    .default('todo')
    .notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high'] })
    .default('medium')
    .notNull(),
  dueDate: timestamp('due_date'),
  isRecurring: boolean('is_recurring').default(false),
  recurringInterval: text('recurring_interval', {
    enum: ['daily', 'weekly', 'monthly', 'none'],
  })
    .default('none')
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tasksSchema = createSelectSchema(tasks);
export const tasksInsertSchema = createInsertSchema(tasks);
export type Tasks = Zod.infer<typeof tasksSchema>;
