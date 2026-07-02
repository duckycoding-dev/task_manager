import { z } from 'zod/v4';

import { multiValueQueryParam } from 'utils/query-params/';

import {
  PRIORITY_OPTIONS,
  RECURRING_OPTIONS,
  STATUS_OPTIONS,
} from './tasks.db';

// 📌 Query Params Schemas
export const getTasksQuerySchema = z.object({
  // Multi-value filters (repeated key: `?status=todo&status=done`).
  // OR semantics within a field, AND across fields.
  projectId: multiValueQueryParam(z.string().uuid()).optional(),
  status: multiValueQueryParam(z.enum(STATUS_OPTIONS)).optional(),
  priority: multiValueQueryParam(z.enum(PRIORITY_OPTIONS)).optional(),
  labelId: multiValueQueryParam(z.string().uuid()).optional(),
  // Exact-match on due date, kept for backwards compat with the original
  // single-value filter. Prefer the range params below.
  dueDate: z.coerce.date().optional(),
  // Inclusive due-date range bounds.
  dueDateGte: z.coerce.date().optional(),
  dueDateLte: z.coerce.date().optional(),
  // Case-insensitive "title contains" search.
  q: z.string().trim().min(1).optional(),
  // When `true`, soft-deleted rows are included. Default `false` filters
  // `deleted_at IS NULL`. See ADR-0002.
  includeDeleted: z.stringbool().default(false),
});

// 📌 Path Params Schemas
export const taskIdParamSchema = z.object({
  taskId: z.string().uuid('Task id should be a valid uuid'),
});
export const projectIdParamSchema = z.object({ projectId: z.string().uuid() });
export const getProjectTasksParamsSchema = z.object({
  projectId: z.string().uuid(),
});

export const taskStatusSchema = z.enum(STATUS_OPTIONS);
export const taskPrioritySchema = z.enum(PRIORITY_OPTIONS);
export const taskRecurringSchema = z.enum(RECURRING_OPTIONS);

// 📌 Types
export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>;
export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;
export type GetProjectTasksParams = z.infer<typeof getProjectTasksParamsSchema>;
export type TaskStatusOption = z.infer<typeof taskStatusSchema>;
export type TaskPriorityOption = z.infer<typeof taskPrioritySchema>;
export type TaskRecurringOption = z.infer<typeof taskRecurringSchema>;
