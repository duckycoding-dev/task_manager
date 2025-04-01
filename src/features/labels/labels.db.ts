import { pgTable, uuid, text, primaryKey } from 'drizzle-orm/pg-core';
import { tasks } from '../tasks/tasks.db';
import { users } from '../auth/auth.db';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import type { z } from 'zod';

// 🚀 Labels Table (Tags for Tasks)
export const labels = pgTable('labels', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // From BetterAuth
  name: text('name').notNull(),
  color: text('color'),
});

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
});
// 📌 Update Schema (for partial updates
export const updateLabelSchema = createUpdateSchema(labels).omit({
  id: true,
});
// 📌 Select Schema (for response data
export const taskLabelsSchema = createSelectSchema(taskLabels);
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
export type TaskLabel = z.infer<typeof taskLabelsSchema>;
export type InsertTaskLabel = z.infer<typeof insertTaskLabelsSchema>;
export type UpdateTaskLabel = z.infer<typeof updateTaskLabelsSchema>;
