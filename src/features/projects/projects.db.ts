import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

// 🚀 Projects Table (Groups tasks)
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(), // From BetterAuth
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
