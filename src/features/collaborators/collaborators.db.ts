import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { tasks } from '../tasks/tasks.db';
import { users } from '../auth/auth.db';

// 🚀 Collaborators Table (Shared Tasks)
export const collaborators = pgTable('collaborators', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // From BetterAuth
  role: text('role', { enum: ['owner', 'editor', 'viewer'] })
    .default('viewer')
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
