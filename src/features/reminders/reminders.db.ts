import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { tasks } from '../tasks/tasks.db';
import { users } from '../auth/auth.db';

// 🚀 Reminders Table (Task Notifications)
export const reminders = pgTable('reminders', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // From BetterAuth
  remindAt: timestamp('remind_at').notNull(),
});
