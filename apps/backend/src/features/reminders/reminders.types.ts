import { z } from 'zod/v4';

import { multiValueQueryParam } from 'utils/query-params/';

// 📌 Query Params Schemas
export const getRemindersQuerySchema = z.object({
  // Multi-value filter (repeated key: `?taskId=A&taskId=B`).
  // OR semantics within the field.
  taskId: multiValueQueryParam(z.string().uuid()).optional(),
  // Inclusive remind-at range bounds. The Inbox "Now" bucket is
  // `remindAtLte=<now>`; no dedicated `expired` flag needed.
  remindAtGte: z.coerce.date().optional(),
  remindAtLte: z.coerce.date().optional(),
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
