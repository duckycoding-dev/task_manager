import { selectReminderSchema } from './reminders.db';
import { z } from 'zod/v4';
import { extendZodWithOpenApi } from '@hono/zod-openapi';
extendZodWithOpenApi(z);
// 📌 Query Params Schemas
export const getRemindersQuerySchema = selectReminderSchema
  .omit({
    remindAt: true,
    userId: true,
    title: true,
    content: true,
  })
  .extend({
    expired: z.boolean(),
    beforeOf: selectReminderSchema.shape.remindAt,
  })
  .partial();

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
