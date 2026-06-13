import { z } from 'zod/v4';

import { selectReminderSchema } from './reminders.db';

// 📌 Query Params Schemas
export const getRemindersQuerySchema = selectReminderSchema
  .omit({
    remindAt: true,
    userId: true,
    title: true,
    content: true,
    deletedAt: true,
  })
  .extend({
    expired: z.boolean(),
    beforeOf: selectReminderSchema.shape.remindAt,
  })
  .partial()
  .extend({
    // When `true`, soft-deleted rows are included. Default `false` filters
    // `deleted_at IS NULL`. See ADR-0002.
    includeDeleted: z.stringbool().default(false),
  });

// 📌 Path Params Schemas
export const reminderIdParamSchema = z.object({
  reminderId: z.string().uuid('Reminder id should be a valid uuid'),
});
export const projectIdParamSchema = z.object({ projectId: z.string().uuid() });
export const getProjectRemindersParamsSchema = z.object({
  projectId: z.string().uuid(),
});

// 📌 Types
export type GetRemindersQuery = z.infer<typeof getRemindersQuerySchema>;
export type ReminderIdParam = z.infer<typeof reminderIdParamSchema>;
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;
export type GetProjectRemindersParams = z.infer<
  typeof getProjectRemindersParamsSchema
>;
