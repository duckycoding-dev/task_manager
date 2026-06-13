import { sql } from 'drizzle-orm';
import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import type { z } from 'zod/v4';

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from '../../utils/drizzle-zod';
import { users } from '../auth/auth.db';
import { tasks } from '../tasks/tasks.db';

// 🚀 Labels Table (Tags for Tasks)
export const labels = pgTable(
  'labels',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }), // From BetterAuth
    name: text('name').notNull(),
    color: text('color'),
    deletedAt: timestamp('deleted_at'),
  },
  (t) => [
    // Partial index per ADR-0002. See tasks.db.ts for rationale.
    index('idx_labels_user_active')
      .on(t.userId)
      .where(sql`${t.deletedAt} IS NULL`),
  ],
);

// 🚀 Many-to-Many: Task <-> Labels
export const taskLabels = pgTable(
  'task_labels',
  {
    taskId: uuid('task_id')
      .references(() => tasks.id, { onDelete: 'cascade' })
      .notNull(),
    labelId: uuid('label_id')
      .references(() => labels.id, {
        onDelete: 'cascade',
      })
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.taskId, t.labelId] }), // Composite Primary Key
  ],
);

// 📌 Select Schema (for response data
export const selectLabelSchema = createSelectSchema(labels);
// 📌 Insert Schema (for creating labels
export const insertLabelSchema = createInsertSchema(labels).omit({
  id: true, // ID is auto-generated
  userId: true, // User ID is set from the session
  deletedAt: true, // server-controlled via soft-delete write path
});
// 📌 Update Schema (for partial updates
export const updateLabelSchema = createUpdateSchema(labels).omit({
  id: true,
  userId: true, // User ID is set from the session
  deletedAt: true, // server-controlled via soft-delete write path
});
// 📌 Select Schema (for response data
export const selectTaskLabelsSchema = createSelectSchema(taskLabels);
// 📌 Insert Schema (for creating label
export const insertTaskLabelsSchema = createInsertSchema(taskLabels).pick({
  taskId: true,
  labelId: true,
});
// 📌 Update Schema (for partial update
export const updateTaskLabelsSchema = createUpdateSchema(taskLabels).omit({
  taskId: true,
  labelId: true,
  // taskId and labelId are part of the composite primary key
  // and should not be updated.
});
// 🔹 Types
export type Label = z.infer<typeof selectLabelSchema>;
export type InsertLabel = z.infer<typeof insertLabelSchema>;
export type UpdateLabel = z.infer<typeof updateLabelSchema>;
export type TaskLabel = z.infer<typeof selectTaskLabelsSchema>;
export type InsertTaskLabel = z.infer<typeof insertTaskLabelsSchema>;
export type UpdateTaskLabel = z.infer<typeof updateTaskLabelsSchema>;
