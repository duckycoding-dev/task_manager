import { z } from 'zod';
import { selectReminderSchema } from './reminders.db';
import {
  type InsertReminder,
  type Reminder,
  type UpdateReminder,
} from './reminders.db';

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

export type GetRemindersResponse = Reminder[];
export type GetReminderResponse = Reminder;
export type CreateReminderRequest = InsertReminder;
export type CreateReminderResponse = Reminder;
export type UpdateReminderRequest = UpdateReminder;
export type UpdateReminderResponse = Reminder;
export type DeleteReminderResponse = { success: boolean };
export type MarkReminderDoneResponse = Reminder;
export type GetProjectRemindersResponse = Reminder[];
export type GetOverdueRemindersResponse = Reminder[];
