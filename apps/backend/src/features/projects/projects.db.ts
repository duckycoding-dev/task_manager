import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { type z } from 'zod/v4';

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from '../../utils/drizzle-zod';
import { users } from '../auth/auth.db';

// 🚀 Projects Table (Groups tasks)
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // From BetterAuth
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersProjects = pgTable('users_projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // From BetterAuth
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 📌 Select Schema (for response data)
export const selectProjectSchema = createSelectSchema(projects);
export const selectUserProjectSchema = createSelectSchema(usersProjects);

// 📌 Insert Schema (for creating projects)
// `color` is technically NOT NULL at the DB level, but the service applies
// a deterministic default via `colorFromName(name)` when the client omits
// it, so we mark it optional in the public schema.
export const insertProjectSchema = createInsertSchema(projects)
  .omit({
    id: true, // ID is auto-generated
    userId: true, // User ID is set from the session
    createdAt: true,
  })
  .partial({ color: true });

// 📌 Insert Schema (for creating user-project relationships)
export const insertUserProjectSchema = createInsertSchema(usersProjects).omit({
  id: true, // ID is auto-generated
  createdAt: true,
  updatedAt: true,
});

// 📌 Update Schema (for partial updates)
export const updateProjectSchema = createUpdateSchema(projects).omit({
  id: true,
  userId: true, // User ID is set from the session
  createdAt: true,
});

// 🔹 Types
export type Project = z.infer<typeof selectProjectSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type UserProject = z.infer<typeof selectUserProjectSchema>;
export type InsertUserProject = z.infer<typeof insertUserProjectSchema>;
